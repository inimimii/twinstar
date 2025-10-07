/* Main */
function myFunction(x) {
  x.classList.toggle("change");
}

const toggleBtn = document.querySelector('.nav-toggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

toggleBtn.addEventListener('click', () => {
    const isActive = sidebar.classList.toggle('active');
    overlay.classList.toggle('active', isActive);
});
overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    toggleBtn.classList.remove('change'); // 🔹 ini yang ditambah
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

function adjustCatalogueAlignment() {
  document.querySelectorAll('.catalogue-items.active').forEach(container => {
    const products = Array.from(container.children).filter(el => el.classList.contains('catalogue-product'));
    if (products.length === 0) return;

    const containerWidth = container.clientWidth;
    const productWidth = products[0].offsetWidth + 15; // plus gap
    // kasih toleransi biar perRow gak gampang turun ke 1 gara2 rounding
    const perRow = Math.max(1, Math.round(containerWidth / productWidth));
    const remainder = products.length % perRow;

    // kalau cuma 1 produk total → tetap center
    if (products.length === 1) {
      container.style.justifyContent = 'center';
      return;
    }

    // kalau sisa 1 di baris terakhir → kiri, selain itu → tengah
    if (remainder === 1) {
      container.style.justifyContent = 'flex-start';
    } else {
      container.style.justifyContent = 'center';
    }
  });
}

window.addEventListener('load', adjustCatalogueAlignment);
window.addEventListener('resize', adjustCatalogueAlignment);

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => setTimeout(adjustCatalogueAlignment, 300));
});

/* Auto App Icon */
async function setPlayStoreIcon(packageName, imgElementId) {
  try {
    const res = await fetch(`https://api-playstore.vercel.app/api/apps?app_id=${packageName}`);
    const data = await res.json();
    if (data.icon) {
      document.getElementById(imgElementId).src = data.icon;
    } else {
      console.warn("Icon not found for", packageName);
    }
  } catch (err) {
    console.error("Failed to fetch icon:", err);
  }
}

setPlayStoreIcon("com.mobile.legends", "mlbb-icon");

/* Cek Nickname & Region MLBB */
const uidEl = document.getElementById('uid');
const zoneEl = document.getElementById('zone');
const result = document.getElementById('result');
const hasil = document.getElementById('hasil');

let useProxy = false;
let proxyBase = '';

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(()=> fn(...args), wait);
    };
}

async function doCheck() {
    const uid = uidEl.value.trim();
    const zone = zoneEl.value.trim();
    if (!uid || !zone) {
        result.innerHTML = '';
        return;
    }
    result.innerHTML = 'Loading...';
    try {
        let url;
        if (useProxy && proxyBase) {
            url = `${proxyBase}?uid=${encodeURIComponent(uid)}&zone=${encodeURIComponent(zone)}`;
        } else if (useProxy && !proxyBase) {
            result.innerHTML = '<div class="error">Proxy belum diatur pada script. Edit variabel <code>proxyBase</code>.</div>';
            return;
        } else {
            url = `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(uid)}&zone=${encodeURIComponent(zone)}`;
        }
        const res = await fetch(url);
        if (!res.ok) {
            result.innerHTML = `<div class="error" style="color:#F5B2B3">User ID tidak ditemukan.</div>`;
            return;
        }
        const json = await res.json();
        let nick = null;
        if (json?.nickname) nick = json.nickname;
        else if (json?.data?.nickname) nick = json.data.nickname;
        else if (json?.name) nick = json.name;
        else if (json?.nick) nick = json.nick;
        else if (json?.result && typeof json.result === 'string') nick = json.result;
        if (nick) {
            result.innerHTML = `<div class="ok" style="color:#ffffff">Selamat datang,<span style="color:#f2f5b2"> ${escapeHtml(nick)}</span><br>Pastikan item sesuai dengan Region akunmu. Kesalahan Region/User ID tidak bisa direfund.</div>`;
        } else {
            result.innerHTML = '<div class="error">Nickname tidak ditemukan pada response. Lihat konsol untuk detail.</div>';
            console.log('Full response JSON:', json);
        }
    } catch (err) {
        result.innerHTML = `<div class="error">Gagal: ${escapeHtml(err.message)}<br/><small>Jika ini error CORS, gunakan proxy di server (lihat contoh di bawah) atau coba endpoint lain.</small></div>`;
        console.error(err);
    }
}

const debouncedCheck = debounce(doCheck, 700);

uidEl.addEventListener('input', debouncedCheck);
zoneEl.addEventListener('input', debouncedCheck);

uidEl.addEventListener('paste', () => setTimeout(debouncedCheck, 50));
zoneEl.addEventListener('paste', () => setTimeout(debouncedCheck, 50));

function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }

btn.addEventListener('click', doCheck);