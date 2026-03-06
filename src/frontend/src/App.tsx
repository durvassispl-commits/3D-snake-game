import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  DoorOpen,
  Gamepad2,
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SnakeScene } from "./components/SnakeScene";
import {
  usePersonalBest,
  useSubmitScore,
  useTopEntries,
} from "./hooks/useQueries";
import { useSnakeGame } from "./hooks/useSnakeGame";
import type { Direction } from "./hooks/useSnakeGame";
import { useSound } from "./hooks/useSound";

// Tabs type
type TabKey = "game" | "leaderboard";

function Leaderboard() {
  const { data: entries, isLoading } = useTopEntries();

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-yellow-400" />
        <h3
          className="text-sm font-display font-bold tracking-widest uppercase"
          style={{ color: "#fbbf24" }}
        >
          Top 10 Players
        </h3>
      </div>

      {isLoading ? (
        <div
          data-ocid="leaderboard.loading_state"
          className="text-center py-8 text-sm"
          style={{ color: "rgba(0,229,255,0.5)" }}
        >
          Loading scores...
        </div>
      ) : !entries || entries.length === 0 ? (
        <div
          data-ocid="leaderboard.empty_state"
          className="text-center py-8 text-sm"
          style={{ color: "rgba(0,229,255,0.4)" }}
        >
          No scores yet. Be the first!
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: leaderboard is positional
              key={i}
              className="lb-row flex items-center justify-between px-3 py-2 rounded-md"
              style={{
                background:
                  i === 0 ? "rgba(251,191,36,0.08)" : "rgba(0,229,255,0.03)",
                border: `1px solid ${i === 0 ? "rgba(251,191,36,0.2)" : "rgba(0,229,255,0.1)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="score-display text-xs w-5 text-right"
                  style={{
                    color:
                      i === 0
                        ? "#fbbf24"
                        : i === 1
                          ? "#9ca3af"
                          : i === 2
                            ? "#cd7c3a"
                            : "rgba(0,229,255,0.5)",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-sm font-medium truncate max-w-[120px]"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {entry.playerName}
                </span>
              </div>
              <span
                className="score-display text-sm font-bold"
                style={{ color: i === 0 ? "#fbbf24" : "#00e5ff" }}
              >
                {Number(entry.score).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface StartScreenProps {
  playerName: string;
  onNameChange: (name: string) => void;
  onPlay: () => void;
}

function StartScreen({ playerName, onNameChange, onPlay }: StartScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("game");
  const { data: personalBest } = usePersonalBest(playerName);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && playerName.trim()) {
      onPlay();
    }
  };

  return (
    <motion.div
      className="game-overlay scanlines"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 size={28} style={{ color: "#00e5ff" }} />
            <h1
              className="text-4xl font-display font-black tracking-tight neon-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              SNAKE 3D
            </h1>
          </div>
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "rgba(0,229,255,0.5)" }}
          >
            Navigate. Grow. Survive.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="w-full mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div
            className="flex rounded-lg overflow-hidden mb-6"
            style={{ border: "1px solid rgba(0,229,255,0.2)" }}
          >
            <button
              type="button"
              data-ocid="snake.game_tab"
              onClick={() => setActiveTab("game")}
              className="flex-1 py-2 text-sm font-display font-semibold tracking-wider uppercase transition-all duration-200"
              style={{
                background:
                  activeTab === "game" ? "rgba(0,229,255,0.15)" : "transparent",
                color: activeTab === "game" ? "#00e5ff" : "rgba(0,229,255,0.4)",
              }}
            >
              Play
            </button>
            <button
              type="button"
              data-ocid="snake.leaderboard_tab"
              onClick={() => setActiveTab("leaderboard")}
              className="flex-1 py-2 text-sm font-display font-semibold tracking-wider uppercase transition-all duration-200"
              style={{
                background:
                  activeTab === "leaderboard"
                    ? "rgba(0,229,255,0.15)"
                    : "transparent",
                color:
                  activeTab === "leaderboard"
                    ? "#00e5ff"
                    : "rgba(0,229,255,0.4)",
              }}
            >
              Leaderboard
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "game" ? (
              <motion.div
                key="game"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="player-name-input"
                    className="block text-xs font-semibold tracking-widest uppercase mb-2"
                    style={{ color: "rgba(0,229,255,0.6)" }}
                  >
                    Your Name
                  </label>
                  <input
                    id="player-name-input"
                    data-ocid="snake.name_input"
                    type="text"
                    value={playerName}
                    onChange={(e) => onNameChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your name..."
                    maxLength={20}
                    className="input-cyber w-full px-4 py-3 rounded-lg text-sm"
                  />
                </div>

                {personalBest !== undefined && playerName.trim() && (
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{
                      background: "rgba(0,229,255,0.06)",
                      border: "1px solid rgba(0,229,255,0.12)",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "rgba(0,229,255,0.6)" }}
                    >
                      Personal Best
                    </span>
                    <span
                      className="score-display text-sm font-bold"
                      style={{ color: "#00e5ff" }}
                    >
                      {Number(personalBest).toLocaleString()}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  data-ocid="snake.play_button"
                  onClick={() => {
                    if (playerName.trim()) onPlay();
                  }}
                  disabled={!playerName.trim()}
                  className="cyber-btn w-full py-4 rounded-lg text-sm font-display font-bold tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Start Game
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Leaderboard />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Controls hint */}
        <motion.p
          className="text-xs text-center"
          style={{ color: "rgba(0,229,255,0.3)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Arrow keys / WASD or tap buttons to move
        </motion.p>
      </div>
    </motion.div>
  );
}

interface GameOverScreenProps {
  score: number;
  playerName: string;
  onPlayAgain: () => void;
}

function GameOverScreen({
  score,
  playerName,
  onPlayAgain,
}: GameOverScreenProps) {
  const { data: personalBest } = usePersonalBest(playerName);
  const isNewBest = personalBest !== undefined && score > Number(personalBest);

  return (
    <motion.div
      data-ocid="snake.game_over_dialog"
      className="game-overlay scanlines"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
        <motion.div
          className="text-center w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          {/* Game over title */}
          <h2
            className="text-3xl font-display font-black mb-1"
            style={{
              color: "#ff4444",
              textShadow:
                "0 0 20px rgba(255, 68, 68, 0.6), 0 0 40px rgba(255,68,68,0.3)",
            }}
          >
            GAME OVER
          </h2>
          <p
            className="text-sm mb-8 tracking-wide"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {playerName}
          </p>

          {/* Score display */}
          <div className="hud-panel rounded-xl p-6 mb-4">
            <div className="mb-4">
              <p
                className="text-xs tracking-widest uppercase mb-1"
                style={{ color: "rgba(0,229,255,0.5)" }}
              >
                Final Score
              </p>
              <p
                className="score-display text-5xl font-black"
                style={{ color: "#00e5ff" }}
              >
                {score.toLocaleString()}
              </p>
            </div>

            {isNewBest && (
              <motion.div
                className="flex items-center justify-center gap-2 mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <Star size={14} className="text-yellow-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-yellow-400">
                  New Personal Best!
                </span>
                <Star size={14} className="text-yellow-400" />
              </motion.div>
            )}

            {personalBest !== undefined && (
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: "rgba(0,229,255,0.5)" }}
                >
                  Personal Best
                </span>
                <span
                  className="score-display text-sm font-bold"
                  style={{ color: "rgba(0,229,255,0.8)" }}
                >
                  {Math.max(score, Number(personalBest)).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            data-ocid="snake.play_again_button"
            onClick={onPlayAgain}
            className="cyber-btn w-full py-4 rounded-lg text-sm font-display font-bold tracking-widest uppercase"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface HUDProps {
  score: number;
  playerName: string;
  isMusicOn: boolean;
  onToggleMusic: () => void;
  onExit: () => void;
}

function HUD({
  score,
  playerName,
  isMusicOn,
  onToggleMusic,
  onExit,
}: HUDProps) {
  return (
    <div
      data-ocid="snake.score_panel"
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
    >
      <div className="hud-panel rounded-xl px-6 py-3 flex items-center gap-8">
        <div className="text-center">
          <p
            className="text-xs tracking-widest uppercase mb-0.5"
            style={{ color: "rgba(0,229,255,0.5)" }}
          >
            Score
          </p>
          <p
            className="score-display text-2xl font-black"
            style={{ color: "#00e5ff" }}
          >
            {score.toLocaleString()}
          </p>
        </div>
        <div
          className="w-px h-8 self-center"
          style={{ background: "rgba(0,229,255,0.15)" }}
        />
        <div className="text-center">
          <p
            className="text-xs tracking-widest uppercase mb-0.5"
            style={{ color: "rgba(0,229,255,0.5)" }}
          >
            Player
          </p>
          <p
            className="text-sm font-semibold max-w-[100px] truncate"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {playerName}
          </p>
        </div>
        <div
          className="w-px h-8 self-center"
          style={{ background: "rgba(0,229,255,0.15)" }}
        />
        {/* Music toggle - needs pointer-events-auto since parent is pointer-events-none */}
        <button
          type="button"
          data-ocid="snake.music_toggle"
          onClick={onToggleMusic}
          className="pointer-events-auto flex flex-col items-center gap-0.5 transition-opacity hover:opacity-70"
          aria-label={isMusicOn ? "Mute music" : "Unmute music"}
        >
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "rgba(0,229,255,0.5)" }}
          >
            Music
          </p>
          {isMusicOn ? (
            <Volume2 size={18} style={{ color: "#00e5ff" }} />
          ) : (
            <VolumeX size={18} style={{ color: "rgba(0,229,255,0.3)" }} />
          )}
        </button>
        <div
          className="w-px h-8 self-center"
          style={{ background: "rgba(0,229,255,0.15)" }}
        />
        {/* Exit button - returns to main menu */}
        <button
          type="button"
          data-ocid="game.exit_button"
          onClick={onExit}
          className="pointer-events-auto flex flex-col items-center gap-0.5 transition-all hover:opacity-70 group"
          aria-label="Exit to main menu"
        >
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "rgba(255,80,80,0.6)" }}
          >
            Exit
          </p>
          <DoorOpen
            size={18}
            style={{ color: "rgba(255,80,80,0.8)" }}
            className="group-hover:text-red-400 transition-colors"
          />
        </button>
      </div>
    </div>
  );
}

interface DPadProps {
  onDirection: (dir: Direction) => void;
}

function DPad({ onDirection }: DPadProps) {
  const btnSize = "w-12 h-12";

  const handlePress = useCallback(
    (dir: Direction) => (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      onDirection(dir);
    },
    [onDirection],
  );

  return (
    <div className="absolute bottom-6 right-6 z-10 select-none">
      <div className="grid grid-cols-3 gap-1.5" style={{ width: "9.5rem" }}>
        {/* Top row */}
        <div />
        <button
          type="button"
          data-ocid="snake.dpad_up"
          className={`dpad-btn ${btnSize}`}
          onMouseDown={handlePress("UP")}
          onTouchStart={handlePress("UP")}
          aria-label="Move up"
        >
          <ChevronUp size={20} />
        </button>
        <div />
        {/* Middle row */}
        <button
          type="button"
          data-ocid="snake.dpad_left"
          className={`dpad-btn ${btnSize}`}
          onMouseDown={handlePress("LEFT")}
          onTouchStart={handlePress("LEFT")}
          aria-label="Move left"
        >
          <ChevronLeft size={20} />
        </button>
        <div
          className="rounded-md"
          style={{
            background: "rgba(0,229,255,0.04)",
            border: "1px solid rgba(0,229,255,0.1)",
          }}
        />
        <button
          type="button"
          data-ocid="snake.dpad_right"
          className={`dpad-btn ${btnSize}`}
          onMouseDown={handlePress("RIGHT")}
          onTouchStart={handlePress("RIGHT")}
          aria-label="Move right"
        >
          <ChevronRight size={20} />
        </button>
        {/* Bottom row */}
        <div />
        <button
          type="button"
          data-ocid="snake.dpad_down"
          className={`dpad-btn ${btnSize}`}
          onMouseDown={handlePress("DOWN")}
          onTouchStart={handlePress("DOWN")}
          aria-label="Move down"
        >
          <ChevronDown size={20} />
        </button>
        <div />
      </div>
    </div>
  );
}

export default function App() {
  const {
    snake,
    food,
    score,
    gameState,
    playerName,
    setPlayerName,
    changeDirection,
    startGame,
    returnToStart,
    setOnEat,
    setOnGameOver,
  } = useSnakeGame();

  const { playEat, playGameOver, playBGM, stopBGM, isMusicOn, toggleMusic } =
    useSound("/assets/dhoom_bgm.mp3");

  const submitScore = useSubmitScore();
  const hasSubmitted = useRef(false);

  // Wire sound event callbacks into the game loop
  useEffect(() => {
    setOnEat(playEat);
  }, [setOnEat, playEat]);

  useEffect(() => {
    setOnGameOver(() => {
      stopBGM();
      playGameOver();
    });
  }, [setOnGameOver, stopBGM, playGameOver]);

  // Handle BGM on game state transitions
  const prevGameState = useRef(gameState);
  useEffect(() => {
    if (gameState === "PLAYING" && prevGameState.current !== "PLAYING") {
      playBGM();
    }
    prevGameState.current = gameState;
  }, [gameState, playBGM]);

  // Exit game and return to main menu
  const handleExit = useCallback(() => {
    stopBGM();
    returnToStart();
  }, [stopBGM, returnToStart]);

  // Submit score when game ends
  useEffect(() => {
    if (
      gameState === "GAMEOVER" &&
      !hasSubmitted.current &&
      playerName.trim()
    ) {
      hasSubmitted.current = true;
      submitScore.mutate({ playerName, score });
    }
    if (gameState === "PLAYING") {
      hasSubmitted.current = false;
    }
  }, [gameState, score, playerName, submitScore]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#050510" }}
    >
      {/* 3D Canvas */}
      <div
        data-ocid="snake.canvas_target"
        className="absolute inset-0"
        style={{ background: "#050510" }}
      >
        <SnakeScene snake={snake} food={food} />
      </div>

      {/* HUD - visible during play */}
      <AnimatePresence>
        {gameState === "PLAYING" && (
          <motion.div
            key="hud"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            <HUD
              score={score}
              playerName={playerName}
              isMusicOn={isMusicOn}
              onToggleMusic={toggleMusic}
              onExit={handleExit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* D-Pad - always visible during play */}
      <AnimatePresence>
        {gameState === "PLAYING" && (
          <motion.div
            key="dpad"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <DPad onDirection={changeDirection} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence mode="wait">
        {gameState === "START" && (
          <StartScreen
            key="start"
            playerName={playerName}
            onNameChange={setPlayerName}
            onPlay={startGame}
          />
        )}

        {gameState === "GAMEOVER" && (
          <GameOverScreen
            key="gameover"
            score={score}
            playerName={playerName}
            onPlayAgain={startGame}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <div
        className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-0"
        style={{ color: "rgba(0,229,255,0.15)", fontSize: "10px" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto hover:opacity-70 transition-opacity"
          style={{ color: "rgba(0,229,255,0.2)" }}
        >
          Built with ♥ using caffeine.ai
        </a>
      </div>
    </div>
  );
}
