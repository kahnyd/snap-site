const { list } = require("@vercel/blob");
const { authorized } = require("./_auth");

module.exports = async (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const blobs = [];
    let cursor;
    do {
      const page = await list({ prefix: "photos/", cursor, limit: 1000 });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(
      blobs.map((b) => ({ url: b.url, uploadedAt: b.uploadedAt, size: b.size }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not list photos" });
  }
};
