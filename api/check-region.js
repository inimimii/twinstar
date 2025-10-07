export default async function handler(req, res) {
  const { uid, zone } = req.query;
  console.log("Got uid, zone:", uid, zone);
  if (!uid || !zone) {
    return res.status(400).json({ error: "Missing UID or Zone ID" });
  }
  try {
    const fetchMod = (await import("node-fetch")).default;
    const response = await fetchMod("https://oggamingx.com/en-en/check-ml", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0"
      },
      body: new URLSearchParams({
        user_id: uid,
        zone_id: zone
      })
    });
    const html = await response.text();
    console.log("Received HTML:", html.substring(0, 300));

    const match = html.match(/Region\s*:<\/strong>\s*([^<]+)/i);
    const region = match ? match[1].trim() : null;

    const nameMatch = html.match(/Nickname\s*:<\/strong>\s*([^<]+)/i);
    const nickname = nameMatch ? nameMatch[1].trim() : null;

    if (!region && !nickname) {
      return res.status(200).json({ error: "Tidak ada data region/nickname di HTML" });
    }

    return res.status(200).json({ uid, zone, nickname, region });
  } catch (err) {
    console.error("ERROR in handler:", err);
    return res.status(500).json({ error: "Gagal mengambil data." });
  }
}
