const STORAGE_KEYS = {
  settings: "chillgaming:settings",
  scores: "chillgaming:scores",
};

const DEFAULT_SETTINGS = {
  nickname: "PLAYER 1",
  difficulty: "normal",
  muted: false,
  music: false,
  theme: "neon",
};

export const GAMES = [
  {
    id: "tetris",
    title: "Tetris",
    genre: "Block puzzle",
    image: "../assets/images/tetris.jpg",
    symbol: "▣",
    description: "Stack tetrominoes, clear neon lines, chase faster levels, and preview the next piece.",
    instructions: ["Move with arrows or WASD.", "Rotate with Up/W.", "Clear lines to score and raise the level.", "Space performs a hard drop."],
  },
  {
    id: "snake",
    title: "Snake",
    genre: "Reflex maze",
    image: "../assets/images/snake.jpg",
    symbol: "◆",
    description: "Steer the snake, eat power pixels, and survive the speed ramp.",
    instructions: ["Move with arrows, WASD, or touch controls.", "Eat food to grow and gain score.", "Speed increases every few bites.", "Avoid walls and your own body."],
  },
  {
    id: "tictactoe",
    title: "Tic-Tac-Toe",
    genre: "Strategy",
    image: "../assets/images/tictactoe.jpg",
    symbol: "X/O",
    description: "Play locally against another player or challenge a quick arcade AI.",
    instructions: ["Choose PVP or VS AI.", "X always starts.", "Three in a row wins.", "Draws add a small score bonus."],
  },
  {
    id: "pacman",
    title: "Pac-Man",
    genre: "Maze chase",
    image: "../assets/images/pacman.jpg",
    symbol: "●",
    description: "Clear a maze of pellets while neon ghosts hunt through the corridors.",
    instructions: ["Move through the maze with arrows, WASD, or touch.", "Collect every pellet to win.", "Ghost contact costs lives.", "Power pellets are worth extra points."],
  },
  {
    id: "flappybird",
    title: "Flappy Bird",
    genre: "Timing",
    image: "../assets/images/flappy_bird.jpg",
    symbol: "◒",
    description: "Tap through pipe gates with jump physics and a rising tempo.",
    instructions: ["Press Space, Up, W, or ACTION to flap.", "Pass pipes to score.", "Gravity and pipe gaps tighten over time.", "Avoid the floor, ceiling, and pipes."],
  },
  {
    id: "spaceinvaders",
    title: "Space Invaders",
    genre: "Shooter",
    image: "../assets/images/space_invaders.png",
    symbol: "▲",
    description: "Slide, fire, and break waves before the invaders reach the shield line.",
    instructions: ["Move with arrows or A/D.", "Shoot with Space, Up, W, or ACTION.", "Clear all enemies to advance waves.", "Protect your lives and stop the invasion line."],
  },
];

export function getSettings() {
  const saved = readJson(STORAGE_KEYS.settings, {});
  const migratedHighScores = migrateLegacyHighScores();
  if (migratedHighScores) {
    writeJson(STORAGE_KEYS.scores, migratedHighScores);
  }
  return { ...DEFAULT_SETTINGS, ...saved };
}

export function saveSettings(partial) {
  const next = { ...getSettings(), ...partial };
  writeJson(STORAGE_KEYS.settings, next);
  window.dispatchEvent(new CustomEvent("chillgaming:settings", { detail: next }));
  return next;
}

export function getScores() {
  return readJson(STORAGE_KEYS.scores, {});
}

export function getGameScores(gameId) {
  return getScores()[gameId] || [];
}

export function getHighScore(gameId) {
  return getGameScores(gameId)[0]?.score || 0;
}

export function saveScore(gameId, score, difficulty, nickname = getSettings().nickname) {
  const numericScore = Math.max(0, Math.floor(Number(score) || 0));
  if (!numericScore && gameId !== "tictactoe") return getGameScores(gameId);

  const scores = getScores();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    gameId,
    nickname: cleanNickname(nickname),
    score: numericScore,
    difficulty,
    date: new Date().toISOString(),
  };

  scores[gameId] = [...(scores[gameId] || []), entry]
    .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
    .slice(0, 10);
  writeJson(STORAGE_KEYS.scores, scores);
  window.dispatchEvent(new CustomEvent("chillgaming:scores", { detail: scores }));
  return scores[gameId];
}

export function getGlobalLeaderboard(limit = 20) {
  const scores = getScores();
  return Object.values(scores)
    .flat()
    .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function getFilteredLeaderboard(gameId = "all", limit = 20) {
  const rows = gameId === "all" ? Object.values(getScores()).flat() : getGameScores(gameId);
  return rows
    .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function cleanNickname(name) {
  return String(name || "PLAYER 1").trim().slice(0, 16).toUpperCase() || "PLAYER 1";
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function migrateLegacyHighScores() {
  const current = getScores();
  const legacySnake = Number(localStorage.getItem("high-score") || 0);
  const legacyTetris = Number(localStorage.getItem("TetrisHighScore") || 0);
  let changed = false;

  if (legacySnake && !(current.snake || []).length) {
    current.snake = [{ id: "legacy-snake", gameId: "snake", nickname: "LEGACY", score: legacySnake, difficulty: "normal", date: new Date().toISOString() }];
    changed = true;
  }

  if (legacyTetris && !(current.tetris || []).length) {
    current.tetris = [{ id: "legacy-tetris", gameId: "tetris", nickname: "LEGACY", score: legacyTetris, difficulty: "normal", date: new Date().toISOString() }];
    changed = true;
  }

  return changed ? current : null;
}
