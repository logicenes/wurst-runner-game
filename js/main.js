// DOM-Elemente
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const gameWrapper = document.getElementById('gameWrapper');
const scoreDisplay = document.getElementById('scoreDisplay');
const player = document.getElementById('player');
const obstacleContainer = document.getElementById('obstacleContainer');
const gameOver = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');



// Initialstatus
startScreen.classList.remove('hidden');
gameWrapper.classList.add('hidden');
gameOver.classList.add('hidden');

let score = 0;
let gameRunning = false;

let gravity = 0.4;
let playerBottom = 20;
let velocity = 0;
let jumping = false;

let obstacles = [];
let spawnTimer = 0;
let spawnInterval = 1500;
let gameSpeed = 4;
let lastTime = 0;

let isSpeedBoostActive = false;
let isInvincible = false;

function startGame() {
  score = 0;
  playerBottom = 20;
  velocity = 0;
  jumping = false;
  obstacles.forEach(o => o.el.remove());
  obstacles = [];
  scoreDisplay.textContent = 'Score: 0';
  spawnTimer = spawnInterval;
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
    velocity -= gravity * (deltaTime / 16.67);
    playerBottom += velocity * (deltaTime / 16.67);

    if (playerBottom <= 20) {
      playerBottom = 20;
      jumping = false;
      velocity = 0;
    }

    player.style.bottom = playerBottom + 'px';
  }
}

function updateObstacles(deltaTime) {
  spawnTimer -= deltaTime;

  if (spawnTimer <= 0) {
    const spawnedSpecial = spawnSpecialItemIfNeeded();
    if (!spawnedSpecial) {
      spawnNormalItem();
    }
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

      const type = obs.el.dataset.type;

      if (type === 'bad' && !isInvincible) {
        endGame();
      } else if (type === 'good') {
        score += 10;
      } else if (type === 'speed') {
        activateSpeedBoost();
      } else if (type === 'star') {
        activateInvincibility();
        activateSpeedBoost(); // ⭐ Stern macht dich jetzt auch schnell!
      }

      obs.el.remove();
      obstacles.splice(i, 1);
      scoreDisplay.textContent = 'Score: ' + score;
    }

    if (obs.right > 1200) {
      obs.el.remove();
      obstacles.splice(i, 1);
    }
  });
}

function spawnSpecialItemIfNeeded() {
  const alreadySpecial = document.querySelector('.star, .tennisball');
  if (alreadySpecial) return false;

  const mod100 = score >= 100 && score % 100 === 0;
  const mod50 = score >= 50 && score % 50 === 0;

  if (mod100) {
    spawnObstacle('star');
    return true;
  } else if (mod50) {
    spawnObstacle('tennisball');
    return true;
  }

  return false;
}

function spawnNormalItem() {
  const isBad = Math.random() < 0.5; // 50% Schokolade
  if (isBad) {
    spawnObstacle('bad');
  } else {
    const type = Math.random() < 0.5 ? 'hotdog' : 'hamburger';
    spawnObstacle(type);
  }
}

function spawnObstacle(type) {
  const obs = document.createElement('div');
  obs.classList.add('obstacle');
  obs.style.right = '-40px';

  switch (type) {
    case 'bad':
      obs.classList.add('bad');
      obs.dataset.type = 'bad';
      break;
    case 'hotdog':
    case 'hamburger':
      obs.classList.add('good', type);
      obs.dataset.type = 'good';
      break;
    case 'tennisball':
      obs.classList.add('tennisball');
      obs.dataset.type = 'speed';
      break;
    case 'star':
      obs.classList.add('star');
      obs.dataset.type = 'star';
      break;
  }

  obstacleContainer.appendChild(obs);
  obstacles.push({ el: obs, right: -40 });
}

function gameLoop(timestamp) {
  if (!gameRunning) return;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  updatePlayer(deltaTime);
  updateObstacles(deltaTime);

  requestAnimationFrame(gameLoop);
}

function activateSpeedBoost() {
  if (isSpeedBoostActive) return;
  isSpeedBoostActive = true;
  gameSpeed = 7;
  spawnInterval = 1000;

  setTimeout(() => {
    gameSpeed = 4;
    spawnInterval = 1500;
    isSpeedBoostActive = false;
  }, 5000);
}

function activateInvincibility() {
  if (isInvincible) return;
  isInvincible = true;
  player.style.opacity = '0.5';

  setTimeout(() => {
    isInvincible = false;
    player.style.opacity = '1';
  }, 5000);
}

