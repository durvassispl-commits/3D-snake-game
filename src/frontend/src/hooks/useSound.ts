import { useCallback, useEffect, useRef, useState } from "react";

// Lazily create a shared AudioContext
let sharedCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

/** Play a synthesized eat-food chime (ascending tones) */
function synthEat(ctx: AudioContext) {
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.07 + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + i * 0.07 + 0.18,
    );
    osc.start(ctx.currentTime + i * 0.07);
    osc.stop(ctx.currentTime + i * 0.07 + 0.2);
  });
}

/** Play a synthesized game-over sound (descending dramatic tones) */
function synthGameOver(ctx: AudioContext) {
  const notes = [
    { freq: 440, t: 0 },
    { freq: 349.23, t: 0.2 },
    { freq: 293.66, t: 0.4 },
    { freq: 220, t: 0.65 },
  ];
  for (const { freq, t } of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
    gain.gain.setValueAtTime(0, ctx.currentTime + t);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
    osc.start(ctx.currentTime + t);
    osc.stop(ctx.currentTime + t + 0.35);
  }
}

export function useSound(bgmSrc: string) {
  const [isMusicOn, setIsMusicOn] = useState(true);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const musicOnRef = useRef(true);

  // Keep ref in sync
  useEffect(() => {
    musicOnRef.current = isMusicOn;
  }, [isMusicOn]);

  // Initialize BGM audio element once
  useEffect(() => {
    const audio = new Audio(bgmSrc);
    audio.loop = true;
    audio.volume = 0.35;
    bgmRef.current = audio;
    return () => {
      audio.pause();
      bgmRef.current = null;
    };
  }, [bgmSrc]);

  const playEat = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") ctx.resume();
      synthEat(ctx);
    } catch {
      // Ignore audio errors
    }
  }, []);

  const playGameOver = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") ctx.resume();
      synthGameOver(ctx);
    } catch {
      // Ignore audio errors
    }
  }, []);

  const playBGM = useCallback(() => {
    if (!bgmRef.current || !musicOnRef.current) return;
    bgmRef.current.currentTime = 0;
    bgmRef.current.play().catch(() => {
      // Autoplay may be blocked; user interaction will unblock it
    });
  }, []);

  const stopBGM = useCallback(() => {
    if (!bgmRef.current) return;
    bgmRef.current.pause();
    bgmRef.current.currentTime = 0;
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicOn((prev) => {
      const next = !prev;
      musicOnRef.current = next;
      if (!next) {
        bgmRef.current?.pause();
      } else {
        bgmRef.current?.play().catch(() => {});
      }
      return next;
    });
  }, []);

  return { playEat, playGameOver, playBGM, stopBGM, isMusicOn, toggleMusic };
}
