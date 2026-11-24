const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  console.warn("[auth] JWT_SECRET not set - using an insecure development secret.");
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, SECRET, { expiresIn: "30d" });
}

async function loadUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    const user = await User.findById(payload.sub);
    // A password change/reset signs out every session that started before it (1 s grace for clock rounding).
    if (user && user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime() - 1000) return null;
    return user;
  } catch {
    return null;
  }
}

// Rejects the request unless a valid token is present.
async function requireAuth(req, res, next) {
  const user = await loadUser(req);
  if (!user) return res.status(401).json({ error: "Please log in" });
  req.user = user;
  next();
}

// Attaches req.user when a valid token is present, but never rejects.
async function optionalAuth(req, res, next) {
  req.user = await loadUser(req);
  next();
}

module.exports = { signToken, requireAuth, optionalAuth };
