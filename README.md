# ChillGaming

ChillGaming is a polished retro arcade web platform built with HTML5, CSS3, vanilla JavaScript ES6+, Canvas API, and LocalStorage.

## Games

- Tetris with falling blocks, rotation, line clears, scoring, levels, pause/restart, game over, next-piece preview, and saved high scores.
- Tic-Tac-Toe with Player vs Player, Player vs AI, win/draw detection, score tracking, restart, and saved local results.
- Snake with grid movement, food spawning, collision detection, increasing speed, score, mobile controls, and saved high scores.
- Pac-Man inspired maze play with pellets, ghosts, collision detection, score, lives, win, and game-over states.
- Flappy Bird style play with jump physics, pipes, collision detection, scoring, increasing difficulty, and restart after game over.
- Space Invaders style play with ship movement, bullets, enemy waves, collision detection, score, lives, and game over.

## Features

- Responsive ChillGaming homepage with hero section, arcade visual, animated background, CRT scanlines, and infinite game marquee.
- Three-column arcade dashboard on desktop with game selection, centered canvas, shared HUD, instructions, controls, and mini leaderboard.
- Modern segmented game selector instead of a native spinner.
- Global LocalStorage leaderboard with nickname, game, score, date, filtering, and top-player highlight.
- Settings panel for nickname, sound effects, background music, difficulty, theme, and fullscreen.
- Generated lightweight sound effects and optional browser-based background hum.
- Organized assets and modular JavaScript managers.

## Project Structure

```text
assets/
  audio/
  fonts/
  icons/
  images/
css/
  global.css
  arcade.css
  dashboard.css
  games.css
  responsive.css
js/
  main.js
  gameManager.js
  storage.js
  audio.js
  ui.js
  leaderboard.js
  input.js
  games/
    tetris.js
    tictactoe.js
    snake.js
    pacman.js
    flappybird.js
    spaceinvaders.js
pages/
  games.html
  leaderboard.html
  about.html
```

## Running Locally

Serve the folder with any static server. The app uses ES modules, so run it through `http://localhost`.

```bash
npx http-server . -p 5500
```

Then visit `http://localhost:5500`.
