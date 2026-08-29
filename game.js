// ===================== PERSIAPAN =====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let capyX = 50;
let capyY = 0;
let capyWidth = 60;
let capyHeight = 60;
let isJumping = false;
let velocityY = 0;
let gravity = 1.5;

let obstacles = [];
let spawnTimer = 0;
let groundY = 0;
let grassPattern;
let playerName = "";
let gameStarted = false;
let gameOver = false;

let score = 0;
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

const scoreDisplay = document.createElement("div");
scoreDisplay.id = "liveScore";
scoreDisplay.style.position = "absolute";
scoreDisplay.style.top = "20px";
scoreDisplay.style.left = "20px";
scoreDisplay.style.color = "black";
scoreDisplay.style.fontSize = "24px";
scoreDisplay.style.fontWeight = "bold";
scoreDisplay.style.backgroundColor = "rgba(255,255,255,0.6)";
scoreDisplay.style.padding = "10px 20px";
scoreDisplay.style.borderRadius = "10px";
scoreDisplay.style.zIndex = "5";
scoreDisplay.style.display = "none";
document.body.appendChild(scoreDisplay);

function updateHighScores(name, score) {
  highScores.push({ name, score });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 5);
  localStorage.setItem("highScores", JSON.stringify(highScores));
}

function showGameOverScreen() {
  gameStarted = false;
  scoreDisplay.style.display = "none";
  document.getElementById("gameOverScreen").style.display = "flex";
  document.getElementById("finalScore").textContent = score;

  document.getElementById("scoreDisplay").style.display = "none";
  document.getElementById("pauseBtn").style.display = "none";
  document.getElementById("resumeBtn").style.display = "none";

  const scoreList = document.getElementById("scoreList");
  scoreList.innerHTML = "";
  highScores.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
    scoreList.appendChild(li);
  });
}

// ===================== GAMBAR DAN SUARA =====================
const capyImg = new Image();
capyImg.src = "capybara-.png";

const obstacleImg = new Image();
obstacleImg.src = "es_krim.png";

const grassImg = new Image();
grassImg.src = "latar.png";
grassImg.onload = () => {
  grassPattern = ctx.createPattern(grassImg, "repeat");
  resizeCanvas();
};

const sounds = {
  jump: new Audio("mario_jump.mp3"),
  gameover: new Audio("game over.mp3"),
};

for (let key in sounds) {
  sounds[key].volume = 0.8;
  sounds[key].preload = "auto";
}

let soundOn = true; // 🌟 Status toggle suara

function playSound(name) {
  if (sounds[name] && soundOn) {
    sounds[name].currentTime = 0;
    sounds[name].play();
  }
}

// ===================== TOMBOL KONTROL =====================
document.getElementById("pauseBtn").addEventListener("click", () => {
  gamePaused = true;
  document.getElementById("pauseBtn").style.display = "none";
  document.getElementById("resumeBtn").style.display = "inline-block";
});

document.getElementById("resumeBtn").addEventListener("click", () => {
  gamePaused = false;
  document.getElementById("resumeBtn").style.display = "none";
  document.getElementById("pauseBtn").style.display = "inline-block";
  requestAnimationFrame(gameLoop);
});

document.getElementById("restartBtn").addEventListener("click", () => {
  resetGame();
});

// ===================== FITUR BARU: TOGGLE SUARA =====================
const toggleSoundBtn = document.createElement("button");
toggleSoundBtn.textContent = "🔈 Suara: ON";
toggleSoundBtn.style.position = "fixed";
toggleSoundBtn.style.top = "20px";
toggleSoundBtn.style.left = "20px";
toggleSoundBtn.style.zIndex = "1000";
toggleSoundBtn.style.padding = "5px 10px";
toggleSoundBtn.style.border = "2px solid #333";
toggleSoundBtn.style.backgroundColor = "#fff";
toggleSoundBtn.style.borderRadius = "5px";
toggleSoundBtn.style.cursor = "pointer";
document.body.appendChild(toggleSoundBtn);

toggleSoundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  toggleSoundBtn.textContent = soundOn ? "🔈 Suara: ON" : "🔇 Suara: OFF";
});

// ===================== JUMP DAN LOMPAT =====================
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !isJumping) {
    isJumping = true;
    velocityY = -25;
    playSound("jump");
  }
});

// 🌟 FITUR BARU: Klik layar juga membuat Capybara melompat
canvas.addEventListener("click", () => {
  if (!isJumping && gameStarted && !gamePaused && !gameOver) {
    isJumping = true;
    velocityY = -25;
    playSound("jump");
  }
});

// ===================== GAME LOGIC =====================
function resetGame() {
  score = 0;
  capyX = 50;
  capyY = groundY - capyHeight;
  isJumping = false;
  velocityY = 0;
  obstacles = [];
  spawnTimer = 0;
  gamePaused = false;
  gameOver = false;

  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("scoreDisplay").style.display = "flex";
  document.getElementById("pauseBtn").style.display = "inline-block";
  document.getElementById("resumeBtn").style.display = "none";

  scoreDisplay.style.display = "block";
  gameStarted = true;
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  groundY = canvas.height - 100;
  capyY = groundY - capyHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function gameLoop() {
  if (!gameStarted || gamePaused) return;

  ctx.fillStyle = "#c0fdfd";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (grassPattern) {
    ctx.fillStyle = grassPattern;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  }

  if (!gamePaused) {
    score++;
    scoreDisplay.innerHTML = `👤 ${playerName} &nbsp;&nbsp; | &nbsp;&nbsp; 🏆 Score: ${score}`;
  }

  if (isJumping) {
    velocityY += gravity;
    capyY += velocityY;

    if (capyY >= groundY - capyHeight) {
      capyY = groundY - capyHeight;
      isJumping = false;
      velocityY = 0;
    }
  }

  ctx.drawImage(capyImg, capyX, capyY, capyWidth, capyHeight);

  spawnTimer++;
  if (spawnTimer > 120) {
    obstacles.push({
      x: canvas.width,
      y: groundY - 30,
      width: 40,
      height: 40,
    });
    spawnTimer = 0;
  }

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= 4;
    ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);

    const margin = 10;
    if (
      !gameOver &&
      capyX + margin < obs.x + obs.width - margin &&
      capyX + capyWidth - margin > obs.x + margin &&
      capyY + margin < obs.y + obs.height - margin &&
      capyY + capyHeight - margin > obs.y + margin
    ) {
      gameOver = true;
      playSound("gameover");
      updateHighScores(playerName, score);
      showGameOverScreen();
      return;
    }
  }

  requestAnimationFrame(gameLoop);
}

// ===================== START GAME =====================
document.getElementById("startBtn").addEventListener("click", () => {
  const input = document.getElementById("playerName").value.trim();
  if (input !== "") {
    playerName = input;
    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block";

    document.getElementById("gameUI").style.display = "flex";
    document.getElementById("scoreDisplay").style.display = "flex";
    document.getElementById("pauseBtn").style.display = "inline-block";
    document.getElementById("restartBtn").style.display = "inline-block";

    gameStarted = true;
    gamePaused = false;
    requestAnimationFrame(gameLoop);
  } else {
    alert("Silakan masukkan nama dulu!");
  }
});

// ===================== FITUR BARU: AUTO-FOCUS INPUT =====================
window.addEventListener("load", () => {
  document.getElementById("playerName").focus();
});
