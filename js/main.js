const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const muteBtn = document.getElementById('muteBtn');
const gameWrapper = document.getElementById('gameWrapper');
const startScreen = document.getElementById('startScreen');
const gameOver = document.getElementById('gameOver');
const scoreDisplay = document.getElementById('scoreDisplay');
const finalScore = document.getElementById('finalScore');
const player = document.getElementById('player');
const obstacleContainer = document.getElementById('obstacleContainer');

const bgMusic = document.getElementById('bgMusic');
const jumpSound = document.getElementById('jumpSound');
const itemSound = document.getElementById('itemSound');

let muted = false;

muteBtn.addEventListener('click', () => {
  muted = !muted;
  bgMusic.muted = muted;
  jumpSound.muted = muted;
  itemSound.muted = muted;
  muteBtn.textContent = muted ? "🔇 Sound Off" : "🔈 Sound On";
});

let score = 0;
let gravity = 0.4;
let playerBottom = 20;
let velocity = 0;
let jumping = false;
let gameRunning = false;
let lastTime = 0;
let spawnTimer = 0;
let spawnInterval = 1500;
let gameSpeed = 4;
let isSpeedBoostActive = false;
let isInvincible = false;
let obstacles = [];

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

  bgMusic.volume = 0.25;
  if (!muted) bgMusic.play();

  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  bgMusic.pause();
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
  if ((e.code === 'Space' || e.code === 'ArrowUp') && gameRunning) {
    jump();
  }
});

// ➕ Touch support
document.addEventListener('touchstart', () => {
  if (gameRunning) {
    jump();
  } else if (!gameRunning && !startScreen.classList.contains('hidden')) {
    startGame();
  }
});

gameWrapper.addEventListener('touchstart', () => {
  if (gameRunning) jump();
});

function jump() {
  if (!jumping) {
    velocity = 12;
    jumping = true;
    if (!muted) {
      jumpSound.currentTime = 0;
      jumpSound.play();
    }
  }
}

function updatePlayer(dt) {
  if (jumping) {
    velocity -= gravity * (dt / 16.67);
    playerBottom += velocity * (dt / 16.67);
    if (playerBottom <= 20) {
      playerBottom = 20;
      velocity = 0;
      jumping = false;
    }
    player.style.bottom = playerBottom + 'px';
  }
}

function updateObstacles(dt) {
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    const special = spawnSpecialItem();
    if (!special) spawnNormalItem();
    spawnTimer = spawnInterval;
  }

  obstacles.forEach((obs, i) => {
    obs.right += gameSpeed * (dt / 16.67);
    obs.el.style.right = obs.right + 'px';

    const playerRect = player.getBoundingClientRect();
    const obsRect = obs.el.getBoundingClientRect();

    if (!(playerRect.right < obsRect.left ||
          playerRect.left > obsRect.right ||
          playerRect.bottom < obsRect.top ||
          playerRect.top > obsRect.bottom)) {
      const type = obs.el.dataset.type;
      if (type === 'bad' && !isInvincible) return endGame();
      if (type === 'good' && !muted) {
        itemSound.currentTime = 0;
        itemSound.play();
        score += 10;
      }
      if (type === 'speed') {
        activateSpeedBoost();
        if (!muted) itemSound.play();
      }
      if (type === 'star') {
        activateInvincibility();
        activateSpeedBoost();
        if (!muted) itemSound.play();
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

function spawnSpecialItem() {
  const mod100 = score >= 100 && score % 100 === 0;
  const mod50 = score >= 50 && score % 50 === 0;
  const alreadySpecial = document.querySelector('.star, .tennisball');
  if (alreadySpecial) return false;

  if (mod100) return spawnObstacle('star'), true;
  if (mod50) return spawnObstacle('tennisball'), true;
  return false;
}

function spawnNormalItem() {
  const isBad = Math.random() < 0.5;
  if (isBad) spawnObstacle('bad');
  else spawnObstacle(Math.random() < 0.5 ? 'hotdog' : 'hamburger');
}

function spawnObstacle(type) {
  const el = document.createElement('div');
  el.classList.add('obstacle');
  el.style.right = '-40px';

  switch (type) {
    case 'bad':
      el.classList.add('bad'); el.dataset.type = 'bad'; break;
    case 'hotdog':
    case 'hamburger':
      el.classList.add('good', type); el.dataset.type = 'good'; break;
    case 'tennisball':
      el.classList.add('tennisball'); el.dataset.type = 'speed'; break;
    case 'star':
      el.classList.add('star'); el.dataset.type = 'star'; break;
  }

  obstacleContainer.appendChild(el);
  obstacles.push({ el, right: -40 });
}

function gameLoop(ts) {
  if (!gameRunning) return;
  const dt = ts - lastTime;
  lastTime = ts;

  updatePlayer(dt);
  updateObstacles(dt);
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
