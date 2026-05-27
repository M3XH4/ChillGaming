import { GAMES, cleanNickname, getHighScore, getSettings, saveSettings } from "./storage.js";
import { isMuted, setMusicEnabled, toggleMute } from "./audio.js";

export function initChrome() {
  renderSettingsPanel();
  applyTheme(getSettings().theme);
  const muteButtons = document.querySelectorAll("[data-mute-toggle]");
  const syncMute = () => {
    muteButtons.forEach((button) => {
      button.textContent = isMuted() ? "🔇" : "🔊";
      button.setAttribute("aria-label", isMuted() ? "Unmute sounds" : "Mute sounds");
    });
  };
  muteButtons.forEach((button) => button.addEventListener("click", () => {
    toggleMute();
    syncMute();
  }));
  syncMute();
}

export function renderGameCards(container, options = {}) {
  const base = options.basePath || "pages/games.html";
  container.innerHTML = GAMES.map((game) => {
    const image = game.image ? `<img src="${normalizeAsset(game.image, options.assetPrefix)}" alt="${game.title} cover">` : "";
    return `
      <article class="game-card pixel-corners">
        <div class="game-card-media">
          ${image}
          <span class="game-symbol">${game.symbol}</span>
        </div>
        <div class="game-card-body">
          <div class="game-meta"><span>${game.genre}</span><span>HI ${getHighScore(game.id)}</span></div>
          <h3>${game.title}</h3>
          <p>${game.description}</p>
          <a class="neon-button" href="${base}?game=${game.id}">Play</a>
        </div>
      </article>
    `;
  }).join("");
}

export function showModal({ title, message, primaryText = "Restart", secondaryText = "Exit", onPrimary, onSecondary }) {
  const modal = document.querySelector("[data-modal]");
  if (!modal) return;
  modal.querySelector("[data-modal-title]").textContent = title;
  modal.querySelector("[data-modal-message]").textContent = message;
  const primary = modal.querySelector("[data-modal-primary]");
  const secondary = modal.querySelector("[data-modal-secondary]");
  primary.textContent = primaryText;
  secondary.textContent = secondaryText;
  primary.onclick = () => {
    modal.classList.remove("is-open");
    onPrimary?.();
  };
  secondary.onclick = () => {
    modal.classList.remove("is-open");
    onSecondary?.();
  };
  modal.classList.add("is-open");
}

function renderSettingsPanel() {
  if (document.querySelector("[data-settings-panel]")) return;
  const settings = getSettings();
  document.body.insertAdjacentHTML("beforeend", `
    <section class="settings-panel" data-settings-panel aria-label="Settings">
      <div class="settings-header">
        <h3>Settings</h3>
        <button class="icon-button" data-settings-close aria-label="Close settings">×</button>
      </div>
      <div class="setting-row">
        <label for="nicknameInput">Nickname</label>
        <input class="arcade-input" id="nicknameInput" maxlength="16" value="${settings.nickname}">
      </div>
      <div class="setting-row">
        <label for="difficultyInput">Default difficulty</label>
        <select class="arcade-select" id="difficultyInput">
          ${["easy", "normal", "hard"].map((value) => `<option value="${value}" ${settings.difficulty === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </div>
      <div class="setting-row">
        <label for="themeInput">Theme</label>
        <select class="arcade-select" id="themeInput">
          ${["neon", "midnight", "hyper"].map((value) => `<option value="${value}" ${settings.theme === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </div>
      <label class="toggle-row"><input type="checkbox" id="soundInput" ${settings.muted ? "" : "checked"}> Sound effects</label>
      <label class="toggle-row"><input type="checkbox" id="musicInput" ${settings.music ? "checked" : ""}> Background music</label>
      <div class="settings-actions">
        <button class="neon-button" data-settings-save>Save</button>
        <button class="ghost-button" data-fullscreen-toggle>Fullscreen</button>
      </div>
    </section>
    <button class="icon-button settings-fab" data-settings-open aria-label="Open settings">⚙</button>
  `);

  const panel = document.querySelector("[data-settings-panel]");
  document.querySelector("[data-settings-open]").addEventListener("click", () => panel.classList.toggle("is-open"));
  document.querySelector("[data-settings-close]").addEventListener("click", () => panel.classList.remove("is-open"));
  document.querySelector("[data-settings-save]").addEventListener("click", () => {
    const next = saveSettings({
      nickname: cleanNickname(document.querySelector("#nicknameInput").value),
      difficulty: document.querySelector("#difficultyInput").value,
      theme: document.querySelector("#themeInput").value,
      muted: !document.querySelector("#soundInput").checked,
      music: document.querySelector("#musicInput").checked,
    });
    applyTheme(next.theme);
    setMusicEnabled(next.music);
    panel.classList.remove("is-open");
  });
  document.querySelector("[data-fullscreen-toggle]").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  });
}

function normalizeAsset(src, prefix = "") {
  if (!prefix) return src;
  return src.replace("../", prefix);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme || "neon";
}
