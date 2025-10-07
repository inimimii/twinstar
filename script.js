/* Main */
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
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(content => content.classList.remove('active'));
        const target = document.getElementById(btn.dataset.tab);
        target.classList.add('active');
    });
});

/* Cek Nickname & Region MLBB */
const uidEl = document.getElementById('uid');
const zoneEl = document.getElementById('zone');
const result = document.getElementById('result');

let useProxy = false;
let proxyBase = ''; // kosongkan jika pakai API langsung

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

async function doCheck() {
  const uid = uidEl.value.trim();
  const zone = zoneEl.value.trim();
  if (!uid || !zone) {
    result.innerHTML = '';
    return;
  }

  result.innerHTML = '🔄 Mengecek nickname & region...';
  try {
    // --- Ambil Nickname ---
    const nickRes = await fetch(`https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(uid)}&zone=${encodeURIComponent(zone)}`);
    if (!nickRes.ok) throw new Error('Gagal mengambil nickname.');
    const nickJson = await nickRes.json();

    let nickname = null;
    if (nickJson?.nickname) nickname = nickJson.nickname;
    else if (nickJson?.data?.nickname) nickname = nickJson.data.nickname;
    else if (nickJson?.name) nickname = nickJson.name;
    else if (nickJson?.nick) nickname = nickJson.nick;
    else if (nickJson?.result && typeof nickJson.result === 'string') nickname = nickJson.result;

    // --- Ambil Region ---
    const regionRes = await fetch(`/api/check-region?uid=${encodeURIComponent(uid)}&zone=${encodeURIComponent(zone)}`);
    let region = "Tidak ditemukan";
    if (regionRes.ok) {
      const regionJson = await regionRes.json();
      if (regionJson?.region) region = regionJson.region;
    }

    if (nickname) {
      result.innerHTML = `
        ✅ Nickname: <b>${escapeHtml(nickname)}</b><br>
        🌍 Region: <b>${escapeHtml(region)}</b>
      `;
    } else {
      result.innerHTML = `<div class="error">Nickname tidak ditemukan.</div>`;
    }

  } catch (err) {
    console.error(err);
    result.innerHTML = `<div class="error">⚠️ Gagal: ${escapeHtml(err.message)}</div>`;
  }
}

const debouncedCheck = debounce(doCheck, 700);

uidEl.addEventListener('input', debouncedCheck);
zoneEl.addEventListener('input', debouncedCheck);

uidEl.addEventListener('paste', () => setTimeout(debouncedCheck, 50));
zoneEl.addEventListener('paste', () => setTimeout(debouncedCheck, 50));

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}
