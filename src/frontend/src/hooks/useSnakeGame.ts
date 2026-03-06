import { useCallback, useEffect, useRef, useState } from "react";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameState = "START" | "PLAYING" | "GAMEOVER";

export interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const TICK_MS = 150;
const INITIAL_LENGTH = 3;

function randomFood(snake: Position[]): Position {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (occupied.has(`${pos.x},${pos.y}`));
  return pos;
}

function buildInitialSnake(): Position[] {
  const mid = Math.floor(GRID_SIZE / 2);
  // Snake goes left -> right, so tail is leftmost
  return Array.from({ length: INITIAL_LENGTH }, (_, i) => ({
    x: mid - (INITIAL_LENGTH - 1 - i),
    y: mid,
  }));
}

const OPPOSITE: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

const DELTA: Record<Direction, { dx: number; dy: number }> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

export interface SnakeGameState {
  snake: Position[];
  food: Position;
  score: number;
  direction: Direction;
  gameState: GameState;
  playerName: string;
}

export function useSnakeGame() {
  const initSnake = buildInitialSnake();
  const [snake, setSnake] = useState<Position[]>(initSnake);
  const [food, setFood] = useState<Position>(() => randomFood(initSnake));
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameState, setGameState] = useState<GameState>("START");
  const [playerName, setPlayerName] = useState("");

  const directionRef = useRef<Direction>("RIGHT");
  const pendingDir = useRef<Direction | null>(null);
  const snakeRef = useRef<Position[]>(initSnake);
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef(0);
  const gameStateRef = useRef<GameState>("START");

  // Keep refs in sync
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const changeDirection = useCallback((newDir: Direction) => {
    if (newDir === OPPOSITE[directionRef.current]) return;
    if (newDir === directionRef.current) return;
    pendingDir.current = newDir;
  }, []);

  const startGame = useCallback(() => {
    const newSnake = buildInitialSnake();
    const newFood = randomFood(newSnake);
    setSnake(newSnake);
    setFood(newFood);
    setScore(0);
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    pendingDir.current = null;
    snakeRef.current = newSnake;
    foodRef.current = newFood;
    scoreRef.current = 0;
    setGameState("PLAYING");
    gameStateRef.current = "PLAYING";
  }, []);

  // Keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameStateRef.current !== "PLAYING") {
        if (e.key === "Enter" && gameStateRef.current === "START") return;
        return;
      }
      const map: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
        W: "UP",
        S: "DOWN",
        A: "LEFT",
        D: "RIGHT",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        changeDirection(dir);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [changeDirection]);

  // Touch swipe handler
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const threshold = 30;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (gameStateRef.current !== "PLAYING") return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? "RIGHT" : "LEFT");
      } else {
        changeDirection(dy > 0 ? "DOWN" : "UP");
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [changeDirection]);

  // Game tick
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const interval = setInterval(() => {
      if (gameStateRef.current !== "PLAYING") return;

      // Consume pending direction
      if (
        pendingDir.current &&
        pendingDir.current !== OPPOSITE[directionRef.current]
      ) {
        directionRef.current = pendingDir.current;
        setDirection(pendingDir.current);
        pendingDir.current = null;
      }

      const currentSnake = snakeRef.current;
      const currentFood = foodRef.current;
      const dir = directionRef.current;
      const head = currentSnake[currentSnake.length - 1];
      const { dx, dy } = DELTA[dir];
      const newHead: Position = { x: head.x + dx, y: head.y + dy };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameState("GAMEOVER");
        gameStateRef.current = "GAMEOVER";
        return;
      }

      // Self collision (skip last tail piece since it moves)
      const snakeWithoutTail = currentSnake.slice(1);
      const selfCollision = snakeWithoutTail.some(
        (s) => s.x === newHead.x && s.y === newHead.y,
      );
      if (selfCollision) {
        setGameState("GAMEOVER");
        gameStateRef.current = "GAMEOVER";
        return;
      }

      // Check food
      const ateFood =
        newHead.x === currentFood.x && newHead.y === currentFood.y;

      let newSnake: Position[];
      if (ateFood) {
        newSnake = [...currentSnake, newHead];
        const newScore = scoreRef.current + 10;
        setScore(newScore);
        scoreRef.current = newScore;
        const newFood = randomFood(newSnake);
        setFood(newFood);
        foodRef.current = newFood;
      } else {
        newSnake = [...currentSnake.slice(1), newHead];
      }

      snakeRef.current = newSnake;
      setSnake(newSnake);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [gameState]);

  return {
    snake,
    food,
    score,
    direction,
    gameState,
    playerName,
    setPlayerName,
    changeDirection,
    startGame,
    gridSize: GRID_SIZE,
  };
}
