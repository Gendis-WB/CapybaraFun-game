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

  // === ATUR TEMA & VISUAL (Siang, Malam, Awan, Bintang) ===
  if (selectedTheme !== 'mix') {
    gameContainer.classList.add(`theme-${selectedTheme}`);
    applyVisualEffects(selectedTheme);
  }

  function applyVisualEffects(theme) {
    visualEffects.innerHTML = '';
    if (theme === 'day' || theme === 'sunset') {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      visualEffects.appendChild(cloud);
    } else if (theme === 'night') {
      for (let i = 0; i < 25; i++) {
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
  let capy = { x: 100, y: 0, width: 90, height: 90, dy: 0 };
  let obstacles = [];

  // === GAMBAR ASSETS ===
  const capyImg = new Image();
  capyImg.src = selectedCharacter;
  capyImg.onerror = () => { capyImg.src = 'char1-rbg.png'; };
  
  const obstacleImg = new Image();
  obstacleImg.src = 'es_krim.png';
  
  const balloonImg = new Image();
  balloonImg.src = 'balon-rbg.png';

// === AUDIO SETUP ===
  const bgm = document.getElementById('bgm');
  const jumpSound = document.getElementById('jumpSound');
  const hitSound = document.getElementById('hitSound');

  if (bgm && musicOn) {
    bgm.volume = 0.4;
    bgm.loop = true; // Pastikan loop menyala
    bgm.play().catch(() => {
      console.warn("Autoplay BGM dicegah browser, menunggu interaksi sentuh/klik.");
    });

    // Solusi agar musik 30 detik terus berulang tanpa terputus
    bgm.addEventListener('ended', () => {
      bgm.currentTime = 0;
      if (musicOn && !isPaused) {
        bgm.play().catch(() => {});
      }
    });
  }

  // === FUNGSI LOMPAT (Trigger Utama Keyboard & Sentuh HP) ===
  function triggerJump() {
    if (canJump && !isPaused) {
      capy.dy = -25;
      canJump = false;
      point++;
      if (sfxOn && jumpSound) {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {});
      }
    }
  }

  // Kontrol Keyboard (Spasi, Panah Atas, W)
  document.addEventListener('keydown', e => {
    if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
      e.preventDefault();
      triggerJump();
    }
  });

  // Kontrol Sentuh / Klik untuk HP & Laptop
  window.addEventListener('touchstart', (e) => {
    // Hindari bentrok jika menekan tombol UI pause/restart
    if (e.target.tagName === 'BUTTON') return;
    if (bgm && bgm.paused && musicOn) bgm.play().catch(() => {});
    triggerJump();
  }, { passive: true });

  window.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    if (bgm && bgm.paused && musicOn) bgm.play().catch(() => {});
  }, { once: true });

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
    const isFlying = Math.random() < 0.35;
    const obs = {
      type: isFlying ? 'balloon' : 'icecream',
      x: canvas.width,
      y: isFlying ? Math.random() * 80 + (canvas.height - 280) : canvas.height - 90,
      width: 50,
      height: isFlying ? 60 : 50,
    };
    obstacles.push(obs);
  }

  function updateCapy() {
    capy.dy += 1;
    capy.y += capy.dy;
    const groundLevel = canvas.height - 90;
    if (capy.y > groundLevel) {
      capy.y = groundLevel;
      capy.dy = 0;
      canJump = true;
    }
  }

  function checkCollision() {
    return obstacles.some(obs =>
      capy.x + 15 < obs.x + obs.width - 15 &&
      capy.x + capy.width - 15 > obs.x + 15 &&
      capy.y + 15 < obs.y + obs.height - 15 &&
      capy.y + capy.height - 15 > obs.y + 15
    );
  }

  function gameLoop() {
    if (!isPaused) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCapy();
      drawObstacles();
      updateCapy();

      if (checkCollision()) {
        if (sfxOn && hitSound) {
          hitSound.currentTime = 0;
          hitSound.play().catch(() => {});
        }
        endGame();
        return;
      }

      score++;
      scoreDisplay.textContent = `Skor: ${score}`;
      pointDisplay.textContent = `Poin: ${point}`;
      if (score % 150 === 0) gameSpeed += 0.5;
    }

    if (selectedTheme === 'mix') {
      const mixMode = Math.floor(score / 800) % 2 === 0 ? 'day' : 'night';
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

  // === TOMBOL UI ===
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');

  pauseBtn.addEventListener('click', () => {
    isPaused = true;
    pauseBtn.style.display = 'none';
    resumeBtn.style.display = 'inline-block';
    if (bgm && !bgm.paused) bgm.pause();
  });

  resumeBtn.addEventListener('click', () => {
    isPaused = false;
    resumeBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    if (musicOn && bgm && bgm.paused) bgm.play();
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    window.location.reload();
  });

  setInterval(() => {
    if (!isPaused) spawnObstacle();
  }, 1400);

  function endGame() {
    if (bgm) bgm.pause();
    localStorage.setItem('finalScore', score);
    localStorage.setItem('finalTime', time);
    localStorage.setItem('finalPoint', point);

    window.location.href = 'projek-.html';
  }

  // Jalankan game
  gameLoop();
});
