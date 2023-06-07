const tetrominoes = [
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ],
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [1,1],
        [1,1]
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
]
const tetrominoesColors = [
    "#00FFFF",
    "#00d0ff",
    "#2a2af7",
    "#f2bd0f",
    "#edff29",
    "#0aeb02",
    "#8503ff",
    "#fa1105"
]

const rows = 20;
const cols = 10;
let canvas = document.querySelector("#tetrisBoard");
let scoreText = document.querySelector(".Tscore");
let highScoreText = document.querySelector(".ThighScore");
const gameOverTModal = document.querySelector("#gameoverTModal")
let startButton = document.querySelector(".startButton");
let score = 0;
let highScore = localStorage.getItem("TetrisHighScore") || 0;
highScoreText.innerText = `High Score: ${highScore}`;
let ctx = canvas.getContext("2d");
ctx.scale(30,30);
let tetrominoesPieces = null
let grid = generateGrid();
let gameOver = false;
let closeButtonClicked = true;
let controls = document.querySelectorAll('.Tcontrol i');
let TsetIntervalID = 0;
console.log(grid);
console.log(tetrominoesPieces);

function generateNewTetrominoes() {
    let random = Math.floor(Math.random() * 7);
    let piece = tetrominoes[random];
    let colorIndex = random + 1;
    let x = 4;
    let y = -1;
    return {piece, x, y, colorIndex};
}
function closeButton() {
    gameOverTModal.style.display = "none";
    clearInterval(TsetIntervalID);
}
const GameOver = () => {
    gameOverTModal.style.display = "block";
}
function restartGame() {
    gameOverTModal.style.display = "none";
    location.reload();
}
function gameStart() {
    if(gameOver) return GameOver()
    checkGrid();
    if (tetrominoesPieces == null) {
        tetrominoesPieces = generateNewTetrominoes();
        renderPiece();
    }
    moveDown();
}
function checkGrid() {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        let allFilled = true;
        for (let j = 0; j < grid[i].length; j++) {
            if(grid[i][j] == 0 ){
                allFilled =false;
            } 
        }
        if (allFilled) {
            grid.splice(i, 1);
            grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            count++;
        }
    }
    if (count == 1){
        score += 10;
    }
    else if (count == 2) {
        score += 30; 
    }
    else if (count == 3) {
        score += 50
    }
    else if (count > 3) {
        score += 100
    }
    highScore = score >= highScore ? score : highScore;
    localStorage.setItem("TetrisHighScore", highScore);   
    scoreText.innerText = `Score: ${score}`;
    highScoreText.innerText = `High Score: ${highScore}`;
    count = 0;
}
function renderPiece() {
    let pieces = tetrominoesPieces.piece;
    for (let i = 0; i < pieces.length; i++){
        for (let j = 0; j < pieces[i].length; j++) {
            if(pieces[i][j] == 1){
                ctx.fillStyle = tetrominoesColors[tetrominoesPieces.colorIndex];
                ctx.fillRect(tetrominoesPieces.x + j, tetrominoesPieces.y + i, 1, 1);
            }
        }
    }
}
function moveDown() {
    if(!tetrominoesCollision(tetrominoesPieces.x, tetrominoesPieces.y + 1)){
        tetrominoesPieces.y += 1;
        renderGrid();
    }
    else {
        if (tetrominoesPieces.y == -1) {
            gameOver = true;
            console.log(gameOver);
        }
        for (let i=0; i < tetrominoesPieces.piece.length; i++){
            for (let j = 0; j < tetrominoesPieces.piece[i].length; j++){
                if (tetrominoesPieces.piece[i][j] == 1 ){
                    let p = tetrominoesPieces.x + j;
                    let q = tetrominoesPieces.y + i;
                    grid[q][p] = tetrominoesPieces.colorIndex;
                }
            }
        }
        tetrominoesPieces = null;
    }
}
function moveLeft() {
    if(!tetrominoesCollision(tetrominoesPieces.x-1, tetrominoesPieces.y)){
        tetrominoesPieces.x -= 1;
        renderGrid();  
    }
}
function moveRight() {
    if(!tetrominoesCollision(tetrominoesPieces.x+1, tetrominoesPieces.y)) {
        tetrominoesPieces.x += 1;
        renderGrid();
    }

}
function tetrominoesCollision(x, y, rotatedPiece) {
    let piece = rotatedPiece ||tetrominoesPieces.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++){
            if(piece[i][j] == 1){
                let p = x+j;
                let q = y+i;
                if (p >= 0 && p < cols && q>=0 && q< rows){
                    if(grid[q][p] > 0) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
    return false;
}
function rotate() {
    let rotatedPiece= [];
    let piece = tetrominoesPieces.piece;
    for (let i = 0; i < piece.length; i++) {
        rotatedPiece.push([]);
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i].push(0);
        }
    }
    for (let i = 0; i < piece.length; i++){
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i][j] = piece[j][i]
        }
    } 

    for (let i=0; i < rotatedPiece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }
    if(!tetrominoesCollision(tetrominoesPieces.x, tetrominoesPieces.y, rotatedPiece)){
        tetrominoesPieces.piece = rotatedPiece;
    }
    renderGrid();   
}
function generateGrid() {
    let grid = [];
    for (let i = 0; i < rows; i++) {
        grid.push([]);
        for (let j = 0; j < cols; j++) {
            grid[i].push(0);

        }
    }
    return grid;
}
function renderGrid() {
    for (let i = 0; i < grid.length; i++){
        for (let j = 0; j < grid[i].length; j++){
            ctx.fillStyle = tetrominoesColors[grid[i][j]];
            ctx.fillRect(j,i, 1,1 );
            
        }
    }
    renderPiece();
} 
function startButtonClick() {
    TsetIntervalID = setInterval(gameStart, 500);
    startButton.style.display = "none";
}
function iconControl() {
    controls.forEach(key => {
        key.addEventListener("click", () =>      
        { key: key.dataset.key ;
        });
    });
}
const changeDirection = (e) => {
    console.log(e)
    if (e.key == "ArrowDown") {
        moveDown();
    }
    else if (e.key == "ArrowLeft") {
        moveLeft();
    }
    else if (e.key == "ArrowRight") {
        moveRight();
    }
    else if (e.key == "ArrowUp") {
        rotate();
    }
}
controls.forEach(key => {
    key.addEventListener("click", () => changeDirection({ key: key.dataset.key }));
});
document.addEventListener("keydown", changeDirection);
