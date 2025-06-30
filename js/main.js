const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const gameWrapper = document.getElementById('gameWrapper');
const scoreDisplay = document.getElementById('scoreDisplay');
const player = document.getElementById('player');
const obstacleContainer = document.getElementById('obstacleContainer');
const gameOver = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

startScreen.classList.remove('hidden');
gameWrapper.classList.add('hidden');
gameOver.classList.add('hidden');

let score = 0;
let gameRunning = false;

let gravity = 0.4; // sehr langsam
let playerBottom = 20;
let velocity = 0;
let jumping = false;

let obstacles = [];
let spawnTimer = 0;
let spawnInterval = 1500;
let gameSpeed = 4;
let lastTime = 0;

function startGame() {
  score = 0;
  playerBottom = 20;
  velocity = 0;
  jumping = false;
  obstacles.forEach(o => o.el.remove());
  obstacles = [];
  scoreDisplay.textContent = 'Score: 0';
  spawnTimer = 0;
  gameRunning = true;
  gameOver.classList.add('hidden');
  gameWrapper.classList.remove('hidden');
  startScreen.classList.add('hidden');
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
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

window.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    jump();
  }
});

function jump() {
  if (!jumping) {
    velocity = 12;
    jumping = true;
  }
}

function updatePlayer(deltaTime) {
  if (jumping) {
    velocity -= gravity * (deltaTime / 16.67); // wird langsamer
    playerBottom += velocity * (deltaTime / 16.67); // bewegt sich

    if (playerBottom <= 20) {
      playerBottom = 20;
      jumping = false;
      velocity = 0;
    }

    player.style.bottom = playerBottom + 'px';
  }
}


function createObstacle() {
  const obs = document.createElement('div');
  const isBad = Math.random() < 0.5;

  obs.classList.add('obstacle');
  obs.style.right = '-30px';

  if (isBad) {
    obs.style.background = 'red';
    obs.dataset.type = 'bad';
  } else {
    obs.style.background = 'orange';
    obs.dataset.type = 'good';
  }

  obstacleContainer.appendChild(obs);
  obstacles.push({ el: obs, right: -30 });
}

function updateObstacles(deltaTime) {
  spawnTimer -= deltaTime;
  if (spawnTimer <= 0) {
    createObstacle();
    spawnTimer = spawnInterval;
  }

  obstacles.forEach((obs, i) => {
    obs.right += gameSpeed * (deltaTime / 16.67);
    obs.el.style.right = obs.right + 'px';

    const playerRect = player.getBoundingClientRect();
    const obsRect = obs.el.getBoundingClientRect();

    if (!(playerRect.right < obsRect.left ||
          playerRect.left > obsRect.right ||
          playerRect.bottom < obsRect.top ||
          playerRect.top > obsRect.bottom)) {

      if (obs.el.dataset.type === 'bad') {
        endGame();
      } else {
        score += 10;
        scoreDisplay.textContent = 'Score: ' + score;
        obs.el.remove();
        obstacles.splice(i, 1);
      }
    }

    if (obs.right > 1200) {
      obs.el.remove();
      obstacles.splice(i, 1);
    }
  });
}

function gameLoop(timestamp) {
  if (!gameRunning) return;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  updatePlayer(deltaTime);
  updateObstacles(deltaTime);

  requestAnimationFrame(gameLoop);
}
