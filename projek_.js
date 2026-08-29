document.addEventListener('DOMContentLoaded', () => {
  // === AMBIL DATA DARI localStorage ===
  const playerName = localStorage.getItem('playerName') || 'Tidak diketahui';
  const selectedTheme = localStorage.getItem('theme') || 'day';
  const selectedCharacter = localStorage.getItem('character') || 'char1-rbg.png';
  const musicOn = localStorage.getItem('musicOn') === 'true';
  const sfxOn = localStorage.getItem('sfxOn') === 'true';

  // === ELEMEN DOM ===
  const gameContainer = document.getElementById('game-container');
  const visualEffects = document.getElementById('visual-effects');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const scoreDisplay = document.getElementById('score');
  const timeDisplay = document.getElementById('time');
  const pointDisplay = document.getElementById('point');
  document.getElementById('playerNameDisplay').textContent = `Pemain: ${playerName}`;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // === ATUR TEMA ===
  if (selectedTheme !== 'mix') {
    gameContainer.classList.add(`theme-${selectedTheme}`);
    applyVisualEffects(selectedTheme);
  }

  function applyVisualEffects(theme) {
    visualEffects.innerHTML = '';
    if (theme === 'day') {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      visualEffects.appendChild(cloud);
    } else if (theme === 'night') {
      for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        visualEffects.appendChild(star);
      }
    }
  }

  // === VARIABEL GAME ===
  let score = 0, time = 0, point = 0;
  let isPaused = false, gameSpeed = 5, canJump = true;
  let capy = { x: 100, y: 0, width: 100, height: 100, dy: 0 };
  let obstacles = [];

  // === GAMBAR ===
  const capyImg = new Image();
  capyImg.src = selectedCharacter;
  capyImg.onerror = () => {
    capyImg.src = 'char1-rbg.png'; // fallback
  };
  const obstacleImg = new Image();
  obstacleImg.src = 'es_krim.png';
  const balloonImg = new Image();
  balloonImg.src = 'balon-rbg.png';

  // === AUDIO ===
  let bgm, jumpSound, hitSound;
  if (musicOn) {
    bgm = new Audio('MusicGame.mp3'); bgm.loop = true;
  }
  if (sfxOn) {
    jumpSound = new Audio('JumpGame.mp3');
    hitSound = new Audio('ClickGame.mp3');
  }

  // === GAME LOOP ===
  function drawCapy() {
    if (capyImg.complete) ctx.drawImage(capyImg, capy.x, capy.y, capy.width, capy.height);
  }

  function drawObstacles() {
    obstacles.forEach(obs => {
      obs.x -= gameSpeed;
      const img = obs.type === 'balloon' ? balloonImg : obstacleImg;
      if (img.complete) ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height);
    });
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
  }

  function spawnObstacle() {
    const isFlying = Math.random() < 0.3;
    const obs = {
      type: isFlying ? 'balloon' : 'icecream',
      x: canvas.width,
      y: isFlying ? Math.random() * 50 + (canvas.height - 270) : canvas.height - 80,
      width: 50,
      height: isFlying ? 60 : 50,
    };
    obstacles.push(obs);
  }

  function updateCapy() {
    capy.dy += 1;
    capy.y += capy.dy;
    if (capy.y > canvas.height - 100) {
      capy.y = canvas.height - 100;
      capy.dy = 0;
      canJump = true;
    }
  }

  function checkCollision() {
    return obstacles.some(obs =>
      capy.x < obs.x + obs.width &&
      capy.x + capy.width > obs.x &&
      capy.y < obs.y + obs.height &&
      capy.y + capy.height > obs.y
    );
  }

  function gameLoop() {
    if (!isPaused) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCapy();
      drawObstacles();
      updateCapy();

      if (checkCollision()) {
        if (sfxOn && hitSound) hitSound.play();
        endGame();
        return;
      }

      score++;
      scoreDisplay.textContent = `Skor: ${score}`;
      pointDisplay.textContent = `Poin: ${point}`;
      if (score % 100 === 0) gameSpeed += 0.5;
    }

    if (selectedTheme === 'mix') {
      const mixMode = Math.floor(score / 1000) % 2 === 0 ? 'day' : 'night';
      gameContainer.className = `theme-${mixMode}`;
      applyVisualEffects(mixMode);
    }

    requestAnimationFrame(gameLoop);
  }

  // === TIMER ===
  setInterval(() => {
    if (!isPaused) {
      time++;
      timeDisplay.textContent = `Waktu: ${time}s`;
    }
  }, 1000);

  // === KONTROL JUMP ===
  document.addEventListener('keydown', e => {
  if ((e.code === 'ArrowUp' || e.code === 'KeyW') && canJump && !isPaused) {
    capy.dy = -28;
    canJump = false;
    point++;
    if (sfxOn && jumpSound) jumpSound.play();
  }
});


  // === TOMBOL ===
  document.getElementById('pauseBtn').addEventListener('click', () => {
    isPaused = true;
    pauseBtn.style.display = 'none';
    resumeBtn.style.display = 'inline';
    if (bgm && !bgm.paused) bgm.pause();
  });

  document.getElementById('resumeBtn').addEventListener('click', () => {
    isPaused = false;
    resumeBtn.style.display = 'none';
    pauseBtn.style.display = 'inline';
    if (bgm && bgm.paused) bgm.play();
    gameLoop();
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    window.location.reload();
  });

  setInterval(() => {
    if (!isPaused) spawnObstacle();
  }, 1500);

  // === MAIN MULAI ===
  document.body.addEventListener('click', () => {
    if (musicOn && bgm && bgm.paused) bgm.play();
  }, { once: true });

  function endGame() {
    localStorage.setItem('finalScore', score);
    localStorage.setItem('finalTime', time);
    localStorage.setItem('finalPoint', point);

    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const existingIndex = leaderboard.findIndex(entry =>
      entry.name === playerName && entry.score === score && entry.time === time
    );

    if (existingIndex === -1) {
      leaderboard.push({ name: playerName, point, score, time });
    }

    leaderboard.sort((a, b) =>
      b.point - a.point || b.score - a.score || a.time - b.time
    );
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    window.location.href = 'projek-.html';
  }

  // Start game
  gameLoop();
});

