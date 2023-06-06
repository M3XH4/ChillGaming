/*console.log("Tic-Tac-Toe");
let turn = "X";
let turnSound = new Audio("resource/ting.mp3");
let boxes = document.getElementsByClassName("box");
let isGameover = false;
Array.from(boxes).forEach(element => {
  let boxText = element.querySelector('.boxText');
  element.addEventListener('click', (e) => {
    if(boxText.innerText === ''){
      boxText.innerText = turn;
      turn = changeTurn();
      turnSound.play()
      if (!isGameover) {
        document.getElementsByClassName("gameTurn")[0].innerText = "Turn for " + turn;
      }
      checkWin();
    }
  })
}) 
const changeTurn = () => {
  return turn === "X" ? "0": "X"
}
const checkWin = () => {
  let boxtext =document.getElementsByClassName('boxText');
  let winningCombo = [
    [0,1,2], [3,4,5], [6,7,8], 
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]];
  winningCombo.forEach(e => {
    if((boxtext[e[0]].innerText === boxtext[e[1]].innerText) && (boxtext[e[2]].innerText === boxtext[e[1]].innerText) && (boxtext[e[0]].innerText !== "")) {
      document.querySelector('.gameTurn').innerText = boxtext[e[0]].innerText + " WON";
      console.log("Won");
      isGameOver = true;
    }
  })
}
resetButton.addEventListener('click', () => {
  let boxTexts = document.querySelectorAll('.boxText');
  Array.from(boxTexts).forEach(element => {
    element.innerText = "";
  });
  turn = "X";
  isGameover = false;
  document.getElementsByClassName("gameTurn")[0].innerText = "Turn for " + turn;
})*/
console.log("Starting Tic-Tac-Toe");
const board = document.querySelector('.gameTTTScreen');
let cells = [];
let currentPlayer = 'X';
let gameActive = true;

for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cells.push(cell);
  board.appendChild(cell);

  cell.addEventListener('click', handleCellClick);
}

function handleCellClick(e) {
  const clickedCell = e.target;
  const clickedCellIndex = cells.indexOf(clickedCell);

  if (!gameActive || cells[clickedCellIndex].innerText !== '') {
    return;
  }
  cells[clickedCellIndex].innerText = currentPlayer;
  cells[clickedCellIndex].style.cursor = 'default';
  if (checkWin()) {
    changeColor(currentPlayer, cells[clickedCellIndex]);
    announceWinner();
  } 
  else if (checkDraw()) {
    changeColor(currentPlayer, cells[clickedCellIndex]);
    announceDraw();
  } 
  else {
    changeColor(currentPlayer, cells[clickedCellIndex]);
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.querySelector('.gameTurn').innerText =`TURN FOR ${currentPlayer}`;
  }
}
resetButton.addEventListener('click', () =>  {
  for (let i = 0; i < 9; i++){
    cells[i].innerText = "";
    cells[i].classList.remove('x');
    cells[i].classList.remove('o');
  }
  currentPlayer = "X";
  gameActive = true;
  document.querySelector('.gameTurn').innerText =`TURN FOR ${currentPlayer}`;
})
function changeColor(turnPlayer, cellText){
  if (turnPlayer === 'X') {
    cellText.classList.add('x');
  }
  else if (turnPlayer === 'O'){
    cellText.classList.add('o');
  }
}
function checkWin() {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]             
  ];

  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (cells[a].innerText !== '' && cells[a].innerText === cells[b].innerText && cells[b].innerText === cells[c].innerText) {
        return true;
    }
  }

  return false;
}
function checkDraw() {
  return [...cells].every(cell => cell.innerText !== '');
}

function announceDraw() {
  gameActive = false;
  document.querySelector('.gameTurn').innerText = "IT'S A DRAW.";
  console.log("Draw");
}

function announceWinner() {
  gameActive = false;
  document.querySelector('.gameTurn').innerText =`PLAYER ${currentPlayer} WINS`;
  console.log("Winner");
}