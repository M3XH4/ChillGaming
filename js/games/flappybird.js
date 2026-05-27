export function createFlappyBird(ctx) {
  const canvas = ctx.canvas;
  const c = canvas.getContext("2d");
  canvas.width = 420;
  canvas.height = 560;
  canvas.classList.add("tall-board");
  let bird;
  let pipes;
  let frame;
  let score;
  let raf;
  let paused = false;
  let over = false;

  ctx.extra.innerHTML = `<h3>Flight Deck</h3><p>Press Space, Arrow Up, W, or tap the jump button to flap.</p>`;

  function start() {
    bird = { x: 92, y: 220, vy: 0, r: 16 };
    pipes = [];
    frame = 0;
    score = 0;
    over = false;
    ctx.setScore(0);
    ctx.setHud({ level: 1, lives: 1, status: "Flying" });
    loop();
  }

  function loop() {
    if (!paused && !over) update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function update() {
    frame += 1;
    const gravity = ctx.difficulty === "hard" ? 0.48 : ctx.difficulty === "easy" ? 0.34 : 0.4;
    bird.vy += gravity;
    bird.y += bird.vy;

    const interval = ctx.difficulty === "hard" ? 78 : ctx.difficulty === "easy" ? 112 : 94;
    if (frame % interval === 0) {
      const gap = Math.max(118, 170 - Math.floor(score / 4) * 7 - (ctx.difficulty === "hard" ? 20 : 0));
      const top = 70 + Math.random() * (canvas.height - gap - 170);
      pipes.push({ x: canvas.width, top, gap, passed: false });
    }

    const speed = 2.6 + score * 0.04 + (ctx.difficulty === "hard" ? 0.7 : 0);
    pipes.forEach((pipe) => {
      pipe.x -= speed;
      if (!pipe.passed && pipe.x + 56 < bird.x) {
        pipe.passed = true;
        score += 1;
        ctx.setScore(score);
        ctx.setHud({ level: 1 + Math.floor(score / 8), status: "Gate " + score });
        ctx.playSound("score");
      }
    });
    pipes = pipes.filter((pipe) => pipe.x > -70);

    if (bird.y - bird.r < 0 || bird.y + bird.r > canvas.height) end();
    for (const pipe of pipes) {
      const inX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + 56;
      const inGap = bird.y - bird.r > pipe.top && bird.y + bird.r < pipe.top + pipe.gap;
      if (inX && !inGap) end();
    }
  }

  function flap() {
    if (over) return;
    bird.vy = -7.4;
    ctx.playSound("move");
  }

  function end() {
    over = true;
    ctx.gameOver("The byte crashed into the signal gates.");
  }

  function draw() {
    const sky = c.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#120821");
    sky.addColorStop(1, "#05020c");
    c.fillStyle = sky;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "rgba(39,232,255,.12)";
    for (let x = -(frame % 40); x < canvas.width; x += 40) c.fillRect(x, 0, 1, canvas.height);
    pipes.forEach((pipe) => {
      c.fillStyle = "#27e8ff";
      c.fillRect(pipe.x, 0, 56, pipe.top);
      c.fillRect(pipe.x, pipe.top + pipe.gap, 56, canvas.height);
      c.fillStyle = "#ff3df2";
      c.fillRect(pipe.x - 4, pipe.top - 10, 64, 10);
      c.fillRect(pipe.x - 4, pipe.top + pipe.gap, 64, 10);
    });
    c.fillStyle = "#ffd166";
    c.beginPath();
    c.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ff3df2";
    c.fillRect(bird.x - 20, bird.y + 2, 18, 6);
  }

  function input(key, event) {
    if ([" ", "ArrowUp", "w"].includes(key)) {
      event?.preventDefault?.();
      flap();
    }
  }

  return {
    start,
    input,
    pause() { paused = true; ctx.setHud({ status: "Paused" }); },
    resume() { paused = false; ctx.setHud({ status: "Flying" }); },
    isPaused() { return paused; },
    destroy() { cancelAnimationFrame(raf); },
  };
}
