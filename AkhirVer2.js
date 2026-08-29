// Ambil data dari localStorage
const finalScore = localStorage.getItem('finalScore') || 0;
const finalTime = localStorage.getItem('finalTime') || 0;
const playerName = localStorage.getItem('playerName') || 'Anonim';
const finalPoint = parseInt(localStorage.getItem('finalPoint') || 0);
const theme = localStorage.getItem('theme') || 'day';
const musicOn = localStorage.getItem('musicOn') === 'true';

// Tampilkan skor & waktu
document.getElementById('finalScore').textContent = `Skor Akhir: ${finalScore}`;
document.getElementById('finalTime').textContent = `Waktu: ${finalTime} detik`;

// Terapkan tema
document.body.classList.add(theme);

// Mainkan musik jika aktif
const music = document.getElementById('gameOverMusic');
if (musicOn) {
  music.src = 'assets/sound/gameover.mp3';
  music.volume = 0.5;
  music.play();
}

// Simpan skor ke leaderboard
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

leaderboard.push({
  name: playerName,
  score: finalScore,
  time: finalTime,
  point: finalPoint
});

leaderboard.sort((a, b) => b.score - a.score);
leaderboard = leaderboard.slice(0, 10);
localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

// === TAMPILKAN TABEL ===
const tbody = document.querySelector('#leaderboard tbody');
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