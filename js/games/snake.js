const GRID = 24;

export function createSnake(ctx) {
  const canvas = ctx.canvas;
  const c = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 600;

  let snake;
  let food;
  let dir;
  let nextDir;
  let timer;
  let score;
  let paused = false;

  ctx.extra.innerHTML = `<h3>Controls</h3><p>Use arrow keys, WASD, or the touch pad. Speed increases every three bites.</p>`;

  function start() {
    snake = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
    food = placeFood();
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    ctx.setScore(0);
    ctx.setHud({ level: 1, lives: 1, status: "Hunting" });
    schedule();
    draw();
  }

  function schedule() {
    clearInterval(timer);
    const base = { easy: 190, normal: 145, hard: 105 }[ctx.difficulty] || 145;
    const speed = Math.max(55, base - Math.floor(score / 3) * 12);
    timer = setInterval(tick, speed);
  }

  function tick() {
    if (paused) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID || snake.some((part) => part.x === head.x && part.y === head.y)) {
      ctx.gameOver("The snake clipped the wall.");
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      food = placeFood();
      ctx.setScore(score);
      ctx.setHud({ level: 1 + Math.floor(score / 30), status: `${snake.length} segments` });
      ctx.playSound("score");
      schedule();
    } else {
      snake.pop();
    }
    draw();
  }

  function placeFood() {
    let next;
    do {
      next = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake?.some((part) => part.x === next.x && part.y === next.y));
    return next;
  }

  function draw() {
    const size = canvas.width / GRID;
    c.fillStyle = "#05020c";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.strokeStyle = "rgba(39,232,255,.12)";
    for (let i = 0; i <= GRID; i++) {
      c.beginPath();
      c.moveTo(i * size, 0);
      c.lineTo(i * size, canvas.height);
      c.moveTo(0, i * size);
      c.lineTo(canvas.width, i * size);
      c.stroke();
    }
    c.fillStyle = "#ff4f81";
    c.shadowBlur = 16;
    c.shadowColor = "#ff4f81";
    c.fillRect(food.x * size + 4, food.y * size + 4, size - 8, size - 8);
    c.shadowColor = "#7cff6b";
    snake.forEach((part, index) => {
      c.fillStyle = index ? "#7cff6b" : "#27e8ff";
      c.fillRect(part.x * size + 2, part.y * size + 2, size - 4, size - 4);
    });
    c.shadowBlur = 0;
  }

  function input(key, event) {
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(key)) event?.preventDefault?.();
    const wanted = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    }[key];
    if (wanted && wanted.x !== -dir.x && wanted.y !== -dir.y) {
      nextDir = wanted;
      ctx.playSound("move");
    }
  }

  return {
    start,
    input,
    pause() { paused = true; ctx.setHud({ status: "Paused" }); },
    resume() { paused = false; ctx.setHud({ status: "Hunting" }); },
    isPaused() { return paused; },
    destroy() { clearInterval(timer); },
  };
}
