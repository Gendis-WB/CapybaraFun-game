// === AUDIO ===
// Musik latar (diputar jika toggle musik aktif)
const bgm = new Audio('MusicGame.mp3'); // Ganti path sesuai foldermu
bgm.loop = true;

// Efek suara
const startSound = new Audio('ClickGame.mp3'); // Klik tombol
const hoverSound = new Audio('JumpGame.mp3');  // Hover karakter

// === INISIALISASI KARAKTER ===
const characters = document.querySelectorAll('.character');
let selectedCharacter = characters[0].src;

// Event klik dan hover untuk karakter
characters.forEach((char) => {
  char.addEventListener('click', () => {
    characters.forEach(c => c.classList.remove('selected'));
    char.classList.add('selected');
    selectedCharacter = char.src;
  });

  // Efek suara saat hover (jika efek suara aktif)
  char.addEventListener('mouseenter', () => {
    const sfxOn = document.getElementById('sfxToggle').checked;
    if (sfxOn) hoverSound.play();
  });
});

// === PLAY BGM SAAT HALAMAN DIBUKA ===
window.addEventListener('load', () => {
  const musicOn = document.getElementById('musicToggle').checked;
  if (musicOn) {
    bgm.play().catch(() => {
      // Jika autoplay diblokir browser
      console.warn("Autoplay diblokir.");
    });
  }
});

// === START GAME BUTTON ===
document.getElementById('startBtn').addEventListener('click', () => {
  const playerName = document.getElementById('playerName').value.trim();
  const theme = document.getElementById('themeSelect').value;
  const musicOn = document.getElementById('musicToggle').checked;
  const sfxOn = document.getElementById('sfxToggle').checked;

  if (!playerName) {
    alert("Masukkan nama dulu ya!");
    return;
  }

  // Mainkan efek klik jika aktif
  if (sfxOn) startSound.play();

  // Simpan data ke localStorage
  localStorage.setItem('playerName', playerName);
  localStorage.setItem('theme', theme);
  localStorage.setItem('character', selectedCharacter);
  localStorage.setItem('musicOn', musicOn);
  localStorage.setItem('sfxOn', sfxOn);

  // Hentikan musik sebelum pindah halaman
  bgm.pause();

  // Tambahkan animasi keluar
  document.querySelector('.start-screen').classList.add('fade-out');

  // Redirect setelah transisi selesai
  setTimeout(() => {
    window.location.href = 'IntiVer2.html';
  }, 800);
});
