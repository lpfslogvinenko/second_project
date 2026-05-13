const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ error: "missing_bearer_token" });
  }
  try {
    const payload = jwt.verify(m[1], process.env.JWT_SECRET);
    req.userId = Number(payload.sub);
    if (!Number.isFinite(req.userId)) {
      return res.status(401).json({ error: "invalid_token" });
    }
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

module.exports = { authMiddleware };
