import { renderLeaderboard, renderLeaderboardFilters } from "./leaderboard.js";
import { initChrome, renderGameCards } from "./ui.js";
import { GAMES, getGlobalLeaderboard } from "./storage.js";

initChrome();

const cards = document.querySelector("[data-game-cards]");
if (cards) {
  const assetPrefix = cards.dataset.assetPrefix || "";
  const basePath = cards.dataset.basePath || "pages/games.html";
  renderGameCards(cards, { assetPrefix, basePath });
}

const leaderboard = document.querySelector("[data-leaderboard]");
if (leaderboard) {
  renderLeaderboard(leaderboard, { limit: Number(leaderboard.dataset.limit || 10) });
}

const leaderboardFilters = document.querySelector("[data-leaderboard-filters]");
const filteredLeaderboard = document.querySelector("[data-filtered-leaderboard]");
if (leaderboardFilters && filteredLeaderboard) {
  renderLeaderboardFilters(leaderboardFilters, filteredLeaderboard, Number(filteredLeaderboard.dataset.limit || 50));
}

const totalGames = document.querySelector("[data-total-games]");
if (totalGames) totalGames.textContent = GAMES.length;

const totalScores = document.querySelector("[data-total-scores]");
if (totalScores) totalScores.textContent = getGlobalLeaderboard(200).length;
