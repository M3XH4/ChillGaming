import { playSound } from "./audio.js";
import { GAMES, getHighScore, getSettings, saveScore, saveSettings } from "./storage.js";
import { createInputManager } from "./input.js";
import { renderMiniLeaderboard } from "./leaderboard.js";
import { initChrome, showModal } from "./ui.js";
import { createTetris } from "./games/tetris.js";
import { createSnake } from "./games/snake.js";
import { createTicTacToe } from "./games/tictactoe.js";
import { createPacman } from "./games/pacman.js";
import { createFlappyBird } from "./games/flappybird.js";
import { createSpaceInvaders } from "./games/spaceinvaders.js";

const factories = {
  tetris: createTetris,
  snake: createSnake,
  tictactoe: createTicTacToe,
  pacman: createPacman,
  flappybird: createFlappyBird,
  spaceinvaders: createSpaceInvaders,
};

let currentGame;
let activeId;
let activeScore = 0;
let roundFinished = false;
let hasStarted = false;
let timerId;
let elapsedSeconds = 0;

initChrome();

const els = {
  picker: document.querySelector("[data-game-picker]"),
  difficulty: document.querySelector("[data-game-difficulty]"),
  title: document.querySelector("[data-game-title]"),
  canvas: document.querySelector("[data-game-canvas]"),
  mount: document.querySelector("[data-game-mount]"),
  instructions: document.querySelector("[data-game-instructions]"),
  extra: document.querySelector("[data-game-extra]"),
  hudGame: document.querySelector("[data-hud-game]"),
  score: document.querySelector("[data-hud-score]"),
  high: document.querySelector("[data-hud-high]"),
  level: document.querySelector("[data-hud-level]"),
  timer: document.querySelector("[data-hud-timer]"),
  lives: document.querySelector("[data-hud-lives]"),
  status: document.querySelector("[data-hud-status]"),
  start: document.querySelector("[data-action-start]"),
  pause: document.querySelector("[data-action-pause]"),
  resume: document.querySelector("[data-action-resume]"),
  restart: document.querySelector("[data-action-restart]"),
  exit: document.querySelector("[data-action-exit]"),
  mobile: document.querySelector("[data-mobile-controls]"),
  leaderboard: document.querySelector("[data-side-leaderboard]"),
};

const settings = getSettings();
els.difficulty.value = settings.difficulty;
els.picker.innerHTML = GAMES.map((game) => `
  <button class="game-tab" data-game-tab="${game.id}">
    <span>${game.symbol}</span>
    <strong>${game.title}</strong>
    <small>${game.genre}</small>
  </button>
`).join("");
const initial = new URLSearchParams(location.search).get("game") || "tetris";

els.picker.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-game-tab]");
  if (!tab) return;
  loadGame(tab.dataset.gameTab);
});
els.difficulty.addEventListener("change", () => {
  saveSettings({ difficulty: els.difficulty.value });
  loadGame(activeId);
});
els.start.addEventListener("click", startGame);
els.pause.addEventListener("click", () => {
  if (!currentGame) return;
  currentGame.pause?.();
  els.pause.disabled = true;
  els.resume.disabled = false;
});
els.resume.addEventListener("click", () => {
  if (!currentGame) return;
  currentGame.resume?.();
  els.pause.disabled = false;
  els.resume.disabled = true;
});
els.restart.addEventListener("click", () => {
  loadGame(activeId);
  startGame();
});
els.exit.addEventListener("click", () => location.href = "../index.html");

createInputManager({
  mobile: els.mobile,
  onInput(key, event) {
    if (!hasStarted) return;
    currentGame?.input?.(key, event);
  },
});

loadGame(factories[initial] ? initial : "tetris");

function loadGame(gameId) {
  currentGame?.destroy?.();
  clearInterval(timerId);
  activeId = gameId;
  activeScore = 0;
  roundFinished = false;
  hasStarted = false;
  elapsedSeconds = 0;
  const game = GAMES.find((item) => item.id === gameId);
  const factory = factories[gameId];

  history.replaceState(null, "", `?game=${gameId}`);
  els.title.textContent = game.title;
  els.picker.querySelectorAll("[data-game-tab]").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.gameTab === gameId));
  els.canvas.className = "";
  els.canvas.hidden = false;
  els.mount.innerHTML = "";
  els.extra.innerHTML = "";
  els.instructions.innerHTML = `
    <h3>${game.title}</h3>
    <p>${game.description}</p>
    <ul>${game.instructions.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
  els.start.disabled = false;
  els.pause.disabled = true;
  els.resume.disabled = true;
  updateHud({ game: game.title, score: 0, high: getHighScore(gameId), level: els.difficulty.value, lives: "∞", timer: "00:00", status: "Press Start" });
  renderMiniLeaderboard(els.leaderboard, gameId, 5);

  const context = {
    canvas: els.canvas,
    mount: els.mount,
    extra: els.extra,
    difficulty: els.difficulty.value,
    setScore(score) {
      activeScore = score;
      updateHud({ score, high: Math.max(getHighScore(gameId), score) });
    },
    setHud: updateHud,
    playSound,
    gameOver(message = "Game over") {
      finishGame(gameId, message, false);
    },
    win(message = "You win") {
      finishGame(gameId, message, true);
    },
  };

  currentGame = factory(context);
  drawReadyScreen(game.title);
}

function startGame() {
  if (!currentGame || hasStarted) return;
  hasStarted = true;
  elapsedSeconds = 0;
  timerId = setInterval(() => {
    if (!currentGame?.isPaused?.()) {
      elapsedSeconds += 1;
      updateHud({ timer: formatTime(elapsedSeconds) });
    }
  }, 1000);
  els.start.disabled = true;
  els.pause.disabled = false;
  els.resume.disabled = true;
  currentGame.start?.();
  playSound("start");
}

function updateHud(values) {
  if ("game" in values) els.hudGame.textContent = values.game;
  if ("score" in values) els.score.textContent = values.score;
  if ("high" in values) els.high.textContent = values.high;
  if ("level" in values) els.level.textContent = values.level;
  if ("timer" in values) els.timer.textContent = values.timer;
  if ("lives" in values) els.lives.textContent = values.lives;
  if ("status" in values) els.status.textContent = values.status;
}

function finishGame(gameId, message, won) {
  if (roundFinished) return;
  roundFinished = true;
  clearInterval(timerId);
  currentGame?.pause?.();
  saveScore(gameId, activeScore, els.difficulty.value, getSettings().nickname);
  renderMiniLeaderboard(els.leaderboard, gameId, 5);
  playSound(won ? "win" : "hit");
  showModal({
    title: won ? "Round Cleared" : "Game Over",
    message: `${message} Final score: ${activeScore}.`,
    primaryText: "Restart",
    secondaryText: "Exit",
    onPrimary: () => {
      loadGame(gameId);
      startGame();
    },
    onSecondary: () => location.href = "../index.html",
  });
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function drawReadyScreen(title) {
  const context = els.canvas.getContext("2d");
  context.fillStyle = "#05020c";
  context.fillRect(0, 0, els.canvas.width, els.canvas.height);
  context.fillStyle = "#27e8ff";
  context.font = "28px Courier New";
  context.textAlign = "center";
  context.fillText(title, els.canvas.width / 2, els.canvas.height / 2 - 18);
  context.fillStyle = "#ff3df2";
  context.font = "18px Courier New";
  context.fillText("PRESS START", els.canvas.width / 2, els.canvas.height / 2 + 24);
}
