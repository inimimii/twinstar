export default async function handler(req, res) {
  const { uid, zone } = req.query;

  if (!uid || !zone) {
    return res.status(400).json({ error: "Missing UID or Zone ID" });
  }

  const fetch = (await import("node-fetch")).default;

  try {
    const response = await fetch("https://oggamingx.com/en-en/check-ml", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      body: new URLSearchParams({
        user_id: uid,
        zone_id: zone
      })
    });

    const html = await response.text();

    // Ambil region dari HTML mereka (regex sederhana)
    const match = html.match(/Region\s*:<\/strong>\s*([^<]+)/i);
    const region = match ? match[1].trim() : "Region tidak ditemukan";

    // Ambil nickname (kalau ada)
    const nameMatch = html.match(/Nickname\s*:<\/strong>\s*([^<]+)/i);
    const nickname = nameMatch ? nameMatch[1].trim() : "Tidak ditemukan";

    return res.status(200).json({ uid, zone, nickname, region });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Gagal mengambil data." });
  }
}
