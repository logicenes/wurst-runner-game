const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const gameWrapper = document.getElementById('gameWrapper');
const scoreDisplay = document.getElementById('scoreDisplay');
const player = document.getElementById('player');
const obstacleContainer = document.getElementById('obstacleContainer');
const gameOver = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let gameRunning = false;

function startGame() {
  score = 0;
  scoreDisplay.textContent = 'Score: 0';
  gameOver.classList.add('hidden');
  gameWrapper.classList.remove('hidden');
  startScreen.classList.add('hidden');
  gameRunning = true;
}

function endGame() {
  gameRunning = false;
  finalScore.textContent = 'Score: ' + score;
  gameOver.classList.remove('hidden');
  gameWrapper.classList.add('hidden');
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
  gameOver.classList.add('hidden');
  startScreen.classList.remove('hidden');
});
