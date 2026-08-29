// === Ambil data dari localStorage ===
const finalScore = parseInt(localStorage.getItem('finalScore')) || 0;
const finalTime = parseInt(localStorage.getItem('finalTime')) || 0;
const finalPoint = parseInt(localStorage.getItem('finalPoint')) || 0;
const playerName = localStorage.getItem('playerName') || 'Anonim';
const theme = localStorage.getItem('theme') || 'day';
const musicOn = localStorage.getItem('musicOn') === 'true';

// === Tampilkan skor & waktu ke layar ===
document.getElementById('finalScore').textContent = `Skor Akhir: ${finalScore}`;
document.getElementById('finalTime').textContent = `Waktu: ${finalTime} detik`;

// === Terapkan tema ke body ===
document.body.classList.add(theme);

// === Musik game over ===
const music = document.getElementById('gameOverMusic');
if (musicOn) {
  music.src = 'gameover.mp3';
  music.volume = 0.5;
  music.play().catch(() => {
    console.warn("Autoplay musik diblokir oleh browser.");
  });
}

// === Ambil dan update leaderboard ===
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

leaderboard.push({
  name: playerName,
  point: finalPoint,
  score: finalScore,
  time: finalTime
});

// Hapus duplikat berdasarkan kombinasi name-point-score-time
const seen = new Set();
leaderboard = leaderboard.filter(entry => {
  const key = `${entry.name}-${entry.point}-${entry.score}-${entry.time}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// Urutkan dan ambil 10 besar
leaderboard.sort((a, b) =>
  b.point - a.point ||
  b.score - a.score ||
  a.time - b.time
);
leaderboard = leaderboard.slice(0, 10);

// Simpan ulang ke localStorage
localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

// === Tampilkan leaderboard ===
const tbody = document.querySelector('#leaderboard tbody');
tbody.innerHTML = '';

leaderboard.forEach((entry, index) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${entry.name}</td>
    <td class="highlight">${entry.point}</td>
    <td>${entry.score}</td>
    <td>${entry.time}</td>
  `;
  tbody.appendChild(row);
});

// === Tombol Aksi ===
document.getElementById('restartBtn').addEventListener('click', () => {
  window.location.href = 'projek_.html';
});

document.getElementById('homeBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

// (Opsional) Efek suara klik
const clickSound = new Audio('click.mp3');
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => clickSound.play());
});
