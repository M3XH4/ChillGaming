export function createSpaceInvaders(ctx) {
  const canvas = ctx.canvas;
  const c = canvas.getContext("2d");
  canvas.width = 720;
  canvas.height = 520;
  let player;
  let bullets;
  let enemyBullets;
  let enemies;
  let keys;
  let score;
  let lives;
  let wave;
  let paused = false;
  let raf;
  let tick = 0;
  let enemyDir = 1;

  ctx.extra.innerHTML = `<h3>Weapons</h3><p>Move with arrows or A/D. Fire with Space or the shoot button.</p>`;

  function start() {
    player = { x: canvas.width / 2, y: canvas.height - 46, w: 46, h: 18 };
    bullets = [];
    enemyBullets = [];
    keys = new Set();
    score = 0;
    lives = ctx.difficulty === "hard" ? 2 : 3;
    wave = 1;
    spawnWave();
    ctx.setScore(0);
    ctx.setHud({ level: wave, lives, status: "Defending" });
    loop();
  }

  function spawnWave() {
    enemies = [];
    const rows = Math.min(5, 2 + wave);
    const cols = 9;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        enemies.push({ x: 82 + x * 58, y: 52 + y * 38, w: 34, h: 22, alive: true });
      }
    }
  }

  function loop() {
    if (!paused) update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function update() {
    tick += 1;
    if (keys.has("ArrowLeft") || keys.has("a")) player.x -= 5;
    if (keys.has("ArrowRight") || keys.has("d")) player.x += 5;
    player.x = Math.max(10, Math.min(canvas.width - player.w - 10, player.x));

    bullets.forEach((bullet) => bullet.y -= 8);
    enemyBullets.forEach((bullet) => bullet.y += 4.5 + wave * 0.2);
    bullets = bullets.filter((bullet) => bullet.y > -20);
    enemyBullets = enemyBullets.filter((bullet) => bullet.y < canvas.height + 20);

    const step = (0.42 + wave * 0.08 + (ctx.difficulty === "hard" ? 0.28 : 0)) * enemyDir;
    let edge = false;
    enemies.forEach((enemy) => {
      enemy.x += step;
      if (enemy.x < 20 || enemy.x + enemy.w > canvas.width - 20) edge = true;
    });
    if (edge) {
      enemyDir *= -1;
      enemies.forEach((enemy) => enemy.y += 16);
    }

    bullets.forEach((bullet) => {
      const hit = enemies.find((enemy) => enemy.alive && overlaps(bullet, enemy));
      if (hit) {
        hit.alive = false;
        bullet.dead = true;
        score += 20;
        ctx.setScore(score);
        ctx.playSound("score");
      }
    });
    bullets = bullets.filter((bullet) => !bullet.dead);
    enemies = enemies.filter((enemy) => enemy.alive);

    if (tick % Math.max(28, 72 - wave * 5) === 0 && enemies.length) {
      const shooter = enemies[Math.floor(Math.random() * enemies.length)];
      enemyBullets.push({ x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h, w: 4, h: 12 });
    }

    enemyBullets.forEach((bullet) => {
      if (overlaps(bullet, player)) {
        bullet.dead = true;
        lives -= 1;
        ctx.setHud({ lives, status: "Hull hit" });
        ctx.playSound("hit");
        if (lives <= 0) ctx.gameOver("The invaders broke through.");
      }
    });
    enemyBullets = enemyBullets.filter((bullet) => !bullet.dead);

    if (enemies.some((enemy) => enemy.y + enemy.h >= player.y)) ctx.gameOver("The invaders reached the defense line.");
    if (!enemies.length) {
      wave += 1;
      score += 100;
      ctx.setScore(score);
      ctx.setHud({ level: wave, lives, status: "Wave " + wave });
      spawnWave();
    }
  }

  function shoot() {
    if (bullets.length > 3) return;
    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y - 12, w: 4, h: 14 });
    ctx.playSound("move");
  }

  function draw() {
    c.fillStyle = "#05020c";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "rgba(39,232,255,.18)";
    for (let x = 0; x < canvas.width; x += 36) c.fillRect(x, canvas.height - 24, 20, 2);
    c.fillStyle = "#27e8ff";
    c.fillRect(player.x, player.y, player.w, player.h);
    c.fillStyle = "#ffd166";
    c.beginPath();
    c.moveTo(player.x + player.w / 2, player.y - 18);
    c.lineTo(player.x + player.w, player.y);
    c.lineTo(player.x, player.y);
    c.closePath();
    c.fill();
    c.fillStyle = "#ff3df2";
    enemies.forEach((enemy) => c.fillRect(enemy.x, enemy.y, enemy.w, enemy.h));
    c.fillStyle = "#7cff6b";
    bullets.forEach((bullet) => c.fillRect(bullet.x, bullet.y, bullet.w, bullet.h));
    c.fillStyle = "#ff4f81";
    enemyBullets.forEach((bullet) => c.fillRect(bullet.x, bullet.y, bullet.w, bullet.h));
  }

  function input(key, event) {
    if (["ArrowLeft", "ArrowRight", " ", "a", "d"].includes(key)) event?.preventDefault?.();
    if (key === " " || key === "ArrowUp" || key === "w") shoot();
    if (["ArrowLeft", "ArrowRight", "a", "d"].includes(key)) {
      keys.add(key);
      setTimeout(() => keys.delete(key), 90);
    }
  }

  return {
    start,
    input,
    pause() { paused = true; ctx.setHud({ status: "Paused" }); },
    resume() { paused = false; ctx.setHud({ status: "Defending" }); },
    isPaused() { return paused; },
    destroy() { cancelAnimationFrame(raf); },
  };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
