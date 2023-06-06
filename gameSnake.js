console.log('Playing Snake');
const playBoard = document.querySelector('.playBoard');
const scoreText = document.querySelector('.score');
const highScoreText = document.querySelector('.highScore');
const gameOverModal = document.getElementById('gameoverModal');
const controls = document.querySelectorAll('.control i');
let gameOver = false;
let foodX;
let foodY;
let snakeX = 13;
let snakeY = 10;
let snakeBody = []; 
let velocityX = 0;
let velocityY = 0;
let setIntervalID = 0;
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;
highScoreText.innerText = `High Score: ${highScore}`;
const changeFoodPosition = () => {
    foodX = Math.floor(Math.random() *30) + 1;
    foodY = Math.floor(Math.random() *30) + 1;
};
const handleGameOver = () => {
    clearInterval(setIntervalID);
    gameOverModal.style.display = "block";
}
function retryFunction() {
    gameOverModal.style.display = "none";
    location.reload();
}
const changeDirection = (e) => {
    if(e.key === "ArrowUp" && velocityY != 1){
        velocityX = 0;
        velocityY = -1;
    }
    else if(e.key === "ArrowDown" && velocityY != -1){
        velocityX = 0;
        velocityY = 1;
    }
    else if(e.key === "ArrowLeft" && velocityX != 1){
        velocityX = -1;
        velocityY = 0;
    }
    else if(e.key === "ArrowRight" && velocityX != -1){
        velocityX = 1;
        velocityY = 0;
    }
    moveGame();
}
controls.forEach(key => {
    key.addEventListener("click", () => changeDirection({ key: key.dataset.key }));
});
const moveGame = () => {
    if(gameOver) return handleGameOver();
    let putObjects = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        snakeBody.push([foodX, foodY]);
        console.log(snakeBody);
        score++;
        
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);   
        scoreText.innerText = `Score: ${score}`;
        highScoreText.innerText = `High Score: ${highScore}`;
    }
    for (let i = snakeBody.length - 1; i > 0; i--){
        snakeBody[i] =  snakeBody[i-1];
    }
    snakeBody[0] = [snakeX, snakeY];
    snakeX += velocityX;
    snakeY += velocityY; 
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        gameOver = true;
    }
    for (let i=0; i < snakeBody.length; i++){
        putObjects += `<div class="snakeHead" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]){
            gameOver=true;
        }
    } 
    playBoard.innerHTML = putObjects;
};
changeFoodPosition();
setIntervalID =  setInterval(moveGame, 125)
document.addEventListener("keydown", changeDirection);