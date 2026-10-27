const { put } = require("@vercel/blob");
const { authorized } = require("./_auth");

const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB request bodies

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BYTES) {
        return res.status(413).json({ error: "Image too large" });
      }
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    // JPEG files start with FF D8
    if (body.length < 4 || body[0] !== 0xff || body[1] !== 0xd8) {
      return res.status(400).json({ error: "Body must be a JPEG" });
    }

    const name =
      String(req.headers["x-filename"] || "photo.jpg")
        .replace(/[^A-Za-z0-9_.-]/g, "")
        .slice(0, 80) || "photo.jpg";

    const blob = await put(`photos/${name}`, body, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true, // makes each URL unguessable
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
};
