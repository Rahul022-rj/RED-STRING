const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

async function register(req, res) {
  const { username, password, displayName } = req.body || {};
  if (!USERNAME_RE.test(String(username || ""))) {
    return res.status(400).json({ error: "Username must be 3-20 letters, numbers or underscores" });
  }
  if (typeof password !== "string" || password.length < 6 || password.length > 100) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const lower = username.toLowerCase();
  if (await User.exists({ username: lower })) {
    return res.status(409).json({ error: "That username is taken" });
  }
  const name = String(displayName || username).trim().slice(0, 24) || username;
  const user = await User.create({
    username: lower,
    displayName: name,
    passwordHash: await bcrypt.hash(password, 10)
  });
  res.status(201).json({ token: signToken(user), profile: user.toProfile() });
}

async function login(req, res) {
  const { username, password } = req.body || {};
  const user = await User.findOne({ username: String(username || "").toLowerCase() });
  const ok = user && (await bcrypt.compare(String(password || ""), user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Wrong username or password" });
  res.json({ token: signToken(user), profile: user.toProfile() });
}

async function me(req, res) {
  res.json({ profile: req.user.toProfile() });
}

module.exports = { register, login, me };
