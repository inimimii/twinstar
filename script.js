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
            result.innerHTML = `<div class="error">User ID tidak ditemukan.</div>`;
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
            result.innerHTML = `<div class="ok"><div>Selamat datang, ${escapeHtml(nick)}</div>`;
        } else {
            result.innerHTML = '<div class="error">Nickname tidak ditemukan pada response. Lihat konsol untuk detail.</div>';
            console.log('Full response JSON:', json);
        }
    } catch (err) {
        result.innerHTML = `<div class="error">Gagal: ${escapeHtml(err.message)}<br/><small>Jika ini error CORS, gunakan proxy di server (lihat contoh di bawah) atau coba endpoint lain.</small></div>`;
        console.error(err);
    }
}

async function cekRegion() {
    const uid = document.getElementById('uid').value;
    const zone = document.getElementById('zone').value;
    document.getElementById('hasil').innerText = "Loading...";
    const response = await fetch(`proxy.php?uid=${uid}&zone=${zone}`);
    const text = await response.text();
    document.getElementById('hasil').innerHTML = text;
}

const debouncedCheck = debounce(doCheck, 700);

uidEl.addEventListener('input', debouncedCheck);
zoneEl.addEventListener('input', debouncedCheck);

uidEl.addEventListener('paste', () => setTimeout(debouncedCheck, 50));
zoneEl.addEventListener('paste', () => setTimeout(debouncedCheck, 50));

function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }

btn.addEventListener('click', doCheck);