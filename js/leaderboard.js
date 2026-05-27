import { GAMES, getFilteredLeaderboard, getGameScores } from "./storage.js";

export function renderLeaderboard(container, options = {}) {
  if (!container) return;
  const gameId = options.gameId || "all";
  const limit = options.limit || Number(container.dataset.limit || 10);
  const rows = getFilteredLeaderboard(gameId, limit);

  if (!rows.length) {
    container.innerHTML = `<div class="empty-board"><h3>No scores yet</h3><p>Start a game and put your nickname on the board.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="top-player">${highlightText(rows[0])}</div>
    <div class="table-scroll">
      <table class="leaderboard-table">
        <thead><tr><th>Rank</th><th>Player</th><th>Game</th><th>Score</th><th>Date</th></tr></thead>
        <tbody>
          ${rows.map((row, index) => `
            <tr class="${index === 0 ? "is-top" : ""}">
              <td>#${index + 1}</td>
              <td>${row.nickname}</td>
              <td>${gameTitle(row.gameId)}</td>
              <td>${row.score}</td>
              <td>${formatDate(row.date)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function renderMiniLeaderboard(container, gameId, limit = 5) {
  if (!container) return;
  const rows = getGameScores(gameId).slice(0, limit);
  if (!rows.length) {
    container.innerHTML = `<div class="empty-board"><h3>No scores yet</h3><p>Launch this game and claim the first highlight.</p></div>`;
    return;
  }

  container.innerHTML = `
    <ol class="mini-board">
      ${rows.map((row) => `<li><span>${row.nickname}</span><strong>${row.score}</strong></li>`).join("")}
    </ol>
  `;
}

export function renderLeaderboardFilters(container, target, limit = 50) {
  if (!container || !target) return;
  container.innerHTML = `
    <button class="selector-chip is-active" data-filter-game="all">All Games</button>
    ${GAMES.map((game) => `<button class="selector-chip" data-filter-game="${game.id}">${game.title}</button>`).join("")}
  `;
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-game]");
    if (!button) return;
    container.querySelectorAll("[data-filter-game]").forEach((item) => item.classList.toggle("is-active", item === button));
    renderLeaderboard(target, { gameId: button.dataset.filterGame, limit });
  });
  renderLeaderboard(target, { gameId: "all", limit });
}

export function gameTitle(id) {
  return GAMES.find((game) => game.id === id)?.title || id;
}

function highlightText(row) {
  return `<span>Top Player</span><strong>${row.nickname}</strong><em>${row.score} on ${gameTitle(row.gameId)}</em>`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}
