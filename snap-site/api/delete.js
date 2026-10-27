const { del } = require("@vercel/blob");
const { authorized } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const url = req.body && req.body.url;
    if (typeof url !== "string" || !url.startsWith("https://") || !url.includes("/photos/")) {
      return res.status(400).json({ error: "Invalid url" });
    }
    await del(url);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Delete failed" });
  }
};
