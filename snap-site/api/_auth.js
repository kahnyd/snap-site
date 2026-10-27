const crypto = require("crypto");

// Compares the x-snap-key header against the SNAP_KEY environment variable.
exports.authorized = function authorized(req) {
  const expected = process.env.SNAP_KEY || "";
  if (!expected) return false; // fail closed if the key was never configured
  const given = String(req.headers["x-snap-key"] || "");
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
};
