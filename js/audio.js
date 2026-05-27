import { getSettings, saveSettings } from "./storage.js";

let ctx;
let musicNodes;

export function isMuted() {
  return getSettings().muted;
}

export function setMuted(muted) {
  saveSettings({ muted: Boolean(muted) });
  if (muted) stopMusic();
}

export function toggleMute() {
  const next = !isMuted();
  setMuted(next);
  return next;
}

export function isMusicEnabled() {
  return getSettings().music;
}

export function setMusicEnabled(enabled) {
  saveSettings({ music: Boolean(enabled) });
  if (enabled) startMusic();
  else stopMusic();
}

export function startMusic() {
  if (isMuted() || musicNodes) return;
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.018, ctx.currentTime);
  const bass = ctx.createOscillator();
  const shimmer = ctx.createOscillator();
  bass.type = "sawtooth";
  shimmer.type = "triangle";
  bass.frequency.setValueAtTime(55, ctx.currentTime);
  shimmer.frequency.setValueAtTime(110, ctx.currentTime);
  bass.connect(gain);
  shimmer.connect(gain);
  gain.connect(ctx.destination);
  bass.start();
  shimmer.start();
  musicNodes = { bass, shimmer, gain };
}

export function stopMusic() {
  if (!musicNodes) return;
  musicNodes.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  setTimeout(() => {
    musicNodes?.bass.stop();
    musicNodes?.shimmer.stop();
    musicNodes = null;
  }, 140);
}

export function playSound(type = "move") {
  if (isMuted()) return;
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();

  const patterns = {
    move: [220, 0.035, "square", 0.025],
    score: [660, 0.08, "triangle", 0.045],
    hit: [110, 0.11, "sawtooth", 0.05],
    start: [440, 0.09, "square", 0.045],
    win: [880, 0.16, "triangle", 0.055],
  };

  const [frequency, duration, wave, volume] = patterns[type] || patterns.move;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}
