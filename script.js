const toggleBtn = document.querySelector('.nav-toggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
});
overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

function updateCountdown() {
    document.querySelectorAll(".countdown").forEach(el => {
        const endTime = new Date(el.dataset.time).getTime();
        const now = new Date().getTime();
        let diff = endTime - now;
        if (diff <= 0) {
            el.textContent = "Expired!";
        } else {
            let h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            let m = Math.floor((diff / (1000 * 60)) % 60);
            let s = Math.floor((diff / 1000) % 60);
            el.textContent = `${h}j ${m}m ${s}d`;
        }
     });
}
setInterval(updateCountdown, 1000);
updateCountdown();

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.catalogue-items');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Hapus active dari semua tombol
    tabButtons.forEach(b => b.classList.remove('active'));
    // Tambahkan active ke tombol yang diklik
    btn.classList.add('active');
    
    // Sembunyikan semua konten
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Tampilkan konten sesuai tab
    const target = document.getElementById(btn.dataset.tab);
    target.classList.add('active');
  });
});