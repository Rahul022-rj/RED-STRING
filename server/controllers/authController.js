const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");
const mailer = require("../services/mailer");

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESET_MINUTES = 30;

const APP_URL = () => (process.env.APP_URL || "https://red-string-7n2s.onrender.com").replace(/\/$/, "");
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Same answer whether or not an account exists, so the form can't be used to find accounts.
const GENERIC = { ok: true, message: "If an account matches, we've sent an email. Check your inbox and spam folder." };

function normEmail(v) {
  const e = String(v || "").trim().toLowerCase();
  return EMAIL_RE.test(e) && e.length <= 254 ? e : null;
}

async function register(req, res) {
  const { username, password, displayName, email } = req.body || {};
  if (!USERNAME_RE.test(String(username || ""))) {
    return res.status(400).json({ error: "Username must be 3-20 letters, numbers or underscores" });
  }
  if (typeof password !== "string" || password.length < 6 || password.length > 100) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  let mail;
  if (email) {
    mail = normEmail(email);
    if (!mail) return res.status(400).json({ error: "That email address doesn't look right" });
    if (await User.exists({ email: mail })) return res.status(409).json({ error: "That email is already linked to another account" });
  }
  const lower = username.toLowerCase();
  if (await User.exists({ username: lower })) {
    return res.status(409).json({ error: "That username is taken" });
  }
  const name = String(displayName || username).trim().slice(0, 24) || username;
  const user = await User.create({
    username: lower,
    displayName: name,
    passwordHash: await bcrypt.hash(password, 10),
    ...(mail ? { email: mail } : {})
  });
  res.status(201).json({ token: signToken(user), profile: user.toProfile() });
}

// "username" may be a username or the account's email.
async function login(req, res) {
  const { username, password } = req.body || {};
  const id = String(username || "").trim().toLowerCase();
  const user = await User.findOne(id.includes("@") ? { email: id } : { username: id });
  const ok = user && (await bcrypt.compare(String(password || ""), user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Wrong username or password" });
  res.json({ token: signToken(user), profile: user.toProfile() });
}

async function me(req, res) {
  res.json({ profile: req.user.toProfile() });
}

async function forgotPassword(req, res) {
  const id = String((req.body || {}).identifier || "").trim().toLowerCase();
  if (!id) return res.status(400).json({ error: "Enter your username or email" });
  const user = await User.findOne(id.includes("@") ? { email: id } : { username: id });
  if (user && user.email) {
    const token = crypto.randomBytes(32).toString("base64url");
    user.resetTokenHash = sha256(token);
    user.resetTokenExpires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
    await user.save();
    await mailer.sendPasswordReset(user.email, {
      name: user.displayName,
      url: APP_URL() + "/reset-password?token=" + token
    }).catch((e) => console.error("[mail] reset failed:", e.message));
  }
  res.json(GENERIC);
}

async function forgotUsername(req, res) {
  const mail = normEmail((req.body || {}).email);
  if (!mail) return res.status(400).json({ error: "Enter the email linked to your account" });
  const user = await User.findOne({ email: mail });
  if (user) {
    await mailer.sendUsernameReminder(mail, {
      accounts: [{ username: user.username, name: user.displayName }],
      loginUrl: APP_URL() + "/login"
    }).catch((e) => console.error("[mail] username reminder failed:", e.message));
  }
  res.json(GENERIC);
}

async function resetPassword(req, res) {
  const { token, password } = req.body || {};
  if (typeof password !== "string" || password.length < 6 || password.length > 100) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const user = token
    ? await User.findOne({ resetTokenHash: sha256(String(token)), resetTokenExpires: { $gt: new Date() } })
    : null;
  if (!user) return res.status(400).json({ error: "This reset link is invalid or has expired. Ask for a new one." });
  user.passwordHash = await bcrypt.hash(password, 10);
  user.passwordChangedAt = new Date();
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ ok: true, username: user.username });
}

module.exports = { register, login, me, forgotPassword, forgotUsername, resetPassword };
