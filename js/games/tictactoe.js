const WINS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

export function createTicTacToe(ctx) {
  let board;
  let turn;
  let active = true;
  let mode = "ai";
  let score = 0;
  let stats = { x: 0, o: 0, draws: 0 };

  function start() {
    ctx.canvas.hidden = true;
    ctx.extra.innerHTML = `
      <h3>Mode</h3>
      <div class="mode-toggle">
        <button class="ghost-button" data-mode="pvp">PVP</button>
        <button class="ghost-button" data-mode="ai">VS AI</button>
      </div>
      <p>Score: win +100, draw +25. X always starts.</p>
    `;
    ctx.extra.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.mode;
        resetRound();
      });
    });
    ctx.mount.innerHTML = `<div class="ttt-board">${Array.from({ length: 9 }, (_, i) => `<button class="ttt-cell" data-cell="${i}" aria-label="Cell ${i + 1}"></button>`).join("")}</div>`;
    ctx.mount.addEventListener("click", handleClick);
    resetRound();
  }

  function handleClick(event) {
    const cell = event.target.closest("[data-cell]");
    if (!cell || !active) return;
    play(Number(cell.dataset.cell));
  }

  function play(index) {
    if (board[index]) return;
    board[index] = turn;
    ctx.playSound("move");
    render();
    const result = getResult();
    if (result) return finish(result);
    turn = turn === "X" ? "O" : "X";
    ctx.setHud({ status: `Turn ${turn}` });
    if (mode === "ai" && turn === "O") {
      setTimeout(() => {
        if (active) play(bestMove());
      }, 260);
    }
  }

  function bestMove() {
    const empty = board.map((value, index) => value ? null : index).filter((value) => value !== null);
    for (const mark of ["O", "X"]) {
      for (const index of empty) {
        const test = [...board];
        test[index] = mark;
        if (winner(test) === mark) return index;
      }
    }
    return empty.includes(4) ? 4 : empty[Math.floor(Math.random() * empty.length)];
  }

  function getResult() {
    const win = winner(board);
    if (win) return win;
    if (board.every(Boolean)) return "draw";
    return null;
  }

  function finish(result) {
    active = false;
    if (result === "draw") {
      stats.draws += 1;
      score += 25;
      ctx.setScore(score);
      ctx.setHud({ status: "Draw" });
      ctx.gameOver("The grid locked into a draw.");
      return;
    }
    stats[result.toLowerCase()] += 1;
    score += result === "X" ? 100 : 75;
    ctx.setScore(score);
    ctx.setHud({ status: `${result} wins`, lives: `${stats.x}-${stats.o}-${stats.draws}` });
    ctx.win(`Player ${result} wins.`);
  }

  function resetRound() {
    board = Array(9).fill("");
    turn = "X";
    active = true;
    ctx.setScore(score);
    ctx.setHud({ level: mode.toUpperCase(), lives: `${stats.x}-${stats.o}-${stats.draws}`, status: "Turn X" });
    render();
  }

  function render() {
    ctx.mount.querySelectorAll("[data-cell]").forEach((cell, index) => {
      cell.textContent = board[index];
      cell.className = `ttt-cell ${board[index].toLowerCase()}`;
    });
  }

  return {
    start,
    pause() { active = false; ctx.setHud({ status: "Paused" }); },
    resume() { active = !getResult(); ctx.setHud({ status: `Turn ${turn}` }); },
    isPaused() { return !active && !getResult(); },
    destroy() {
      ctx.mount.removeEventListener("click", handleClick);
      ctx.mount.innerHTML = "";
    },
  };
}

function winner(board) {
  for (const [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  return null;
}
