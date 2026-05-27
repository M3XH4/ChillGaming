const MAZE = [
  "###############",
  "#.............#",
  "#.###.###.###.#",
  "#o#.......#..o#",
  "#.###.#.#.###.#",
  "#.....#.#.....#",
  "###.#.#.#.#.###",
  "#...#.....#...#",
  "#.#.#######.#.#",
  "#.#.........#.#",
  "#.###.#.#.###.#",
  "#.....#.#.....#",
  "#.###.###.###.#",
  "#.............#",
  "###############",
];

export function createPacman(ctx) {
  const canvas = ctx.canvas;
  const c = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 600;
  const cell = canvas.width / MAZE.length;
  let pellets;
  let player;
  let ghosts;
  let dir;
  let wanted;
  let score;
  let lives;
  let paused = false;
  let raf;
  let last = 0;

  ctx.extra.innerHTML = `<h3>Maze Rules</h3><p>Clear every pellet. Ghost contact costs a life.</p>`;

  function start() {
    pellets = new Set();
    MAZE.forEach((row, y) => [...row].forEach((tile, x) => {
      if (tile === "." || tile === "o") pellets.add(`${x},${y}`);
    }));
    player = { x: 1, y: 1 };
    ghosts = [{ x: 13, y: 13, color: "#ff4f81" }, { x: 13, y: 1, color: "#27e8ff" }, { x: 1, y: 13, color: "#ff3df2" }];
    dir = { x: 1, y: 0 };
    wanted = dir;
    score = 0;
    lives = ctx.difficulty === "hard" ? 2 : 3;
    ctx.setScore(0);
    ctx.setHud({ level: 1, lives, status: "Pellets left " + pellets.size });
    loop(0);
  }

  function loop(time) {
    if (!paused && time - last > speed()) {
      step();
      last = time;
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function speed() {
    return { easy: 210, normal: 160, hard: 120 }[ctx.difficulty] || 160;
  }

  function step() {
    if (!wall(player.x + wanted.x, player.y + wanted.y)) dir = wanted;
    if (!wall(player.x + dir.x, player.y + dir.y)) {
      player.x += dir.x;
      player.y += dir.y;
    }
    const key = `${player.x},${player.y}`;
    if (pellets.delete(key)) {
      score += MAZE[player.y][player.x] === "o" ? 50 : 10;
      ctx.setScore(score);
      ctx.playSound("score");
      if (!pellets.size) ctx.win("You cleared the maze.");
    }
    ghosts.forEach(moveGhost);
    if (ghosts.some((ghost) => ghost.x === player.x && ghost.y === player.y)) {
      lives -= 1;
      ctx.setHud({ lives, status: "Ghost hit" });
      ctx.playSound("hit");
      player = { x: 1, y: 1 };
      if (lives <= 0) ctx.gameOver("A ghost ended the run.");
    } else {
      ctx.setHud({ lives, status: "Pellets left " + pellets.size });
    }
  }

  function moveGhost(ghost) {
    const options = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]
      .filter((move) => !wall(ghost.x + move.x, ghost.y + move.y));
    options.sort((a, b) => distance(ghost.x + a.x, ghost.y + a.y) - distance(ghost.x + b.x, ghost.y + b.y));
    const smartChance = ctx.difficulty === "easy" ? 0.45 : ctx.difficulty === "hard" ? 0.82 : 0.65;
    const move = Math.random() < smartChance ? options[0] : options[Math.floor(Math.random() * options.length)];
    ghost.x += move.x;
    ghost.y += move.y;
  }

  function distance(x, y) {
    return Math.abs(player.x - x) + Math.abs(player.y - y);
  }

  function wall(x, y) {
    return MAZE[y]?.[x] === "#";
  }

  function draw() {
    c.fillStyle = "#05020c";
    c.fillRect(0, 0, canvas.width, canvas.height);
    MAZE.forEach((row, y) => [...row].forEach((tile, x) => {
      if (tile === "#") {
        c.fillStyle = "#22105a";
        c.fillRect(x * cell, y * cell, cell, cell);
        c.strokeStyle = "#27e8ff";
        c.strokeRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
      } else if (pellets.has(`${x},${y}`)) {
        c.fillStyle = tile === "o" ? "#ffd166" : "#f8f7ff";
        c.beginPath();
        c.arc(x * cell + cell / 2, y * cell + cell / 2, tile === "o" ? 6 : 3, 0, Math.PI * 2);
        c.fill();
      }
    }));
    c.fillStyle = "#ffd166";
    c.beginPath();
    c.arc(player.x * cell + cell / 2, player.y * cell + cell / 2, cell * 0.34, 0.2 * Math.PI, 1.8 * Math.PI);
    c.lineTo(player.x * cell + cell / 2, player.y * cell + cell / 2);
    c.fill();
    ghosts.forEach((ghost) => {
      c.fillStyle = ghost.color;
      c.beginPath();
      c.arc(ghost.x * cell + cell / 2, ghost.y * cell + cell / 2, cell * 0.32, Math.PI, 0);
      c.lineTo(ghost.x * cell + cell * 0.82, ghost.y * cell + cell * 0.82);
      c.lineTo(ghost.x * cell + cell * 0.18, ghost.y * cell + cell * 0.82);
      c.closePath();
      c.fill();
    });
  }

  function input(key, event) {
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(key)) event?.preventDefault?.();
    wanted = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    }[key] || wanted;
  }

  return {
    start,
    input,
    pause() { paused = true; ctx.setHud({ status: "Paused" }); },
    resume() { paused = false; },
    isPaused() { return paused; },
    destroy() { cancelAnimationFrame(raf); },
  };
}
