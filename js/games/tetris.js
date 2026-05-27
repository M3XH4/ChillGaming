const COLS = 10;
const ROWS = 20;
const COLORS = ["#05020c", "#27e8ff", "#2f80ff", "#ff3df2", "#ffd166", "#7cff6b", "#ff4f81", "#a78bfa"];
const PIECES = [
  [[1, 1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
];

export function createTetris(ctx) {
  const canvas = ctx.canvas;
  const boardCtx = canvas.getContext("2d");
  canvas.width = 300;
  canvas.height = 600;
  canvas.classList.add("tall-board");

  let board;
  let current;
  let next;
  let timer;
  let paused = false;
  let score = 0;
  let lines = 0;
  let level = 1;

  ctx.extra.innerHTML = `<h3>Next Piece</h3><canvas class="preview-canvas" width="120" height="120" data-preview></canvas><p>Arrow keys move and rotate. Down soft-drops.</p>`;
  const preview = ctx.extra.querySelector("[data-preview]").getContext("2d");

  function start() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    next = randomPiece();
    spawn();
    draw();
    schedule();
    ctx.setScore(0);
    ctx.setHud({ level, lives: "∞", status: "Stacking" });
  }

  function randomPiece() {
    const index = Math.floor(Math.random() * PIECES.length);
    return {
      matrix: PIECES[index].map((row) => [...row]),
      color: index + 1,
      x: Math.floor(COLS / 2) - 2,
      y: 0,
    };
  }

  function spawn() {
    current = next;
    current.x = Math.floor(COLS / 2) - Math.ceil(current.matrix[0].length / 2);
    current.y = 0;
    next = randomPiece();
    drawPreview();
    if (collides(current.matrix, current.x, current.y)) {
      ctx.gameOver("The stack reached the launch rail.");
    }
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(tick, dropSpeed());
  }

  function dropSpeed() {
    const base = { easy: 760, normal: 560, hard: 390 }[ctx.difficulty] || 560;
    return Math.max(95, base - (level - 1) * 48);
  }

  function tick() {
    if (paused) return;
    if (!move(0, 1)) lock();
    draw();
  }

  function move(dx, dy) {
    if (!current || collides(current.matrix, current.x + dx, current.y + dy)) return false;
    current.x += dx;
    current.y += dy;
    ctx.playSound("move");
    return true;
  }

  function hardDrop() {
    while (move(0, 1)) score += 1;
    lock();
    draw();
  }

  function rotate() {
    const rotated = current.matrix[0].map((_, col) => current.matrix.map((row) => row[col]).reverse());
    if (!collides(rotated, current.x, current.y)) {
      current.matrix = rotated;
      ctx.playSound("move");
      draw();
    }
  }

  function lock() {
    current.matrix.forEach((row, y) => row.forEach((value, x) => {
      if (value && current.y + y >= 0) board[current.y + y][current.x + x] = current.color;
    }));
    clearLines();
    spawn();
  }

  function clearLines() {
    let cleared = 0;
    board = board.filter((row) => {
      const full = row.every(Boolean);
      if (full) cleared += 1;
      return !full;
    });
    while (board.length < ROWS) board.unshift(Array(COLS).fill(0));
    if (!cleared) return;
    const rewards = [0, 100, 300, 500, 800];
    score += rewards[cleared] * level;
    lines += cleared;
    level = 1 + Math.floor(lines / 6);
    ctx.setScore(score);
    ctx.setHud({ level, status: `${lines} lines` });
    ctx.playSound("score");
    schedule();
  }

  function collides(matrix, ox, oy) {
    return matrix.some((row, y) => row.some((value, x) => {
      if (!value) return false;
      const px = ox + x;
      const py = oy + y;
      return px < 0 || px >= COLS || py >= ROWS || (py >= 0 && board[py][px]);
    }));
  }

  function draw() {
    const size = canvas.width / COLS;
    boardCtx.fillStyle = "#05020c";
    boardCtx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(boardCtx, board, 0, 0, size);
    if (current) drawMatrix(boardCtx, current.matrix, current.x, current.y, size, current.color);
    boardCtx.strokeStyle = "rgba(39,232,255,.22)";
    for (let x = 0; x <= COLS; x++) {
      boardCtx.beginPath();
      boardCtx.moveTo(x * size, 0);
      boardCtx.lineTo(x * size, canvas.height);
      boardCtx.stroke();
    }
  }

  function drawPreview() {
    preview.clearRect(0, 0, 120, 120);
    preview.fillStyle = "#05020c";
    preview.fillRect(0, 0, 120, 120);
    const block = 24;
    const offsetX = (120 / block - next.matrix[0].length) / 2;
    const offsetY = (120 / block - next.matrix.length) / 2;
    drawMatrix(preview, next.matrix, offsetX, offsetY, block, next.color);
  }

  function input(key, event) {
    if (paused && key !== "p" && key !== "P") return;
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(key)) event?.preventDefault?.();
    if (key === "ArrowLeft" || key === "a") move(-1, 0);
    if (key === "ArrowRight" || key === "d") move(1, 0);
    if (key === "ArrowDown" || key === "s") tick();
    if (key === "ArrowUp" || key === "w") rotate();
    if (key === " ") hardDrop();
    draw();
  }

  return {
    start,
    input,
    pause() { paused = true; ctx.setHud({ status: "Paused" }); },
    resume() { paused = false; ctx.setHud({ status: "Stacking" }); },
    isPaused() { return paused; },
    destroy() { clearInterval(timer); },
  };
}

function drawMatrix(ctx, matrix, ox, oy, size, forcedColor) {
  matrix.forEach((row, y) => row.forEach((value, x) => {
    if (!value) return;
    const color = forcedColor || value;
    ctx.fillStyle = COLORS[color];
    ctx.fillRect((ox + x) * size + 1, (oy + y) * size + 1, size - 2, size - 2);
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.strokeRect((ox + x) * size + 3, (oy + y) * size + 3, size - 6, size - 6);
  }));
}
