const Progress = require("../models/Progress");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken } = require("../middleware/auth");
const { grant, levelInfo } = require("../services/progression");

// Everything the client needs to resume on any device.
async function getState(req, res) {
  const docs = await Progress.find({ user: req.user._id }).lean();
  const progress = {};
  const boards = {};
  docs.forEach((d) => {
    progress[d.caseId] = d.data || {};
    boards[d.caseId] = d.board || { positions: {}, connections: [] };
  });
  res.json({ profile: req.user.toProfile(), progress, boards });
}

async function saveProgress(req, res) {
  const { data } = req.body || {};
  if (!data || typeof data !== "object") return res.status(400).json({ error: "data object required" });
  const caseId = req.params.caseId;
  const existing = await Progress.findOne({ user: req.user._id, caseId });
  const next = { ...data };
  // Results are written by the server only.
  delete next.completed;
  delete next.result;
  delete next.reward;
  if (existing && existing.data && existing.data.completed) {
    ["completed", "result", "reward", "theory", "accusedAt"].forEach((k) => {
      if (existing.data[k] !== undefined) next[k] = existing.data[k];
    });
  }
  await Progress.updateOne({ user: req.user._id, caseId }, { $set: { data: next } }, { upsert: true });
  res.json({ ok: true });
}

async function saveBoard(req, res) {
  const { board } = req.body || {};
  if (!board || typeof board !== "object") return res.status(400).json({ error: "board object required" });
  const clean = {
    positions: board.positions && typeof board.positions === "object" ? board.positions : {},
    connections: Array.isArray(board.connections) ? board.connections.slice(0, 60) : []
  };
  await Progress.updateOne({ user: req.user._id, caseId: req.params.caseId }, { $set: { board: clean } }, { upsert: true });
  res.json({ ok: true });
}

async function resetProgress(req, res) {
  await Progress.deleteOne({ user: req.user._id, caseId: req.params.caseId });
  res.json({ ok: true });
}

async function updateProfile(req, res) {
  const name = String((req.body || {}).name || "").trim().slice(0, 24);
  if (!name) return res.status(400).json({ error: "Name required" });
  req.user.displayName = name;
  await req.user.save();
  res.json({ profile: req.user.toProfile() });
}

// In-game moments the server can't see directly.
async function recordEvent(req, res) {
  const { type } = req.body || {};
  const u = req.user;
  const unlocked = [];
  if (type === "evidence") {
    u.stats.evidenceFound += 1;
  } else if (type === "break") {
    u.stats.breaks += 1;
    if (u.stats.breaks >= 5 && grant(u, "breaker")) unlocked.push("breaker");
  } else if (type === "lawyered") {
    if (grant(u, "lawyered")) unlocked.push("lawyered");
  } else {
    return res.status(400).json({ error: "Unknown event" });
  }
  await u.save();
  res.json({ profile: u.toProfile(), unlocked });
}

async function leaderboard(req, res) {
  const top = await User.find().sort({ xp: -1, createdAt: 1 }).limit(50).lean();
  const rows = top.map((u, i) => {
    const s = u.stats || {};
    return {
      rank: i + 1,
      id: u._id.toString(),
      name: u.displayName,
      username: u.username,
      xp: u.xp,
      level: levelInfo(u.xp).level,
      title: levelInfo(u.xp).title,
      solved: s.correct || 0,
      accuracy: s.accusations ? Math.round(((s.correct || 0) / s.accusations) * 100) : 0,
      achievements: Object.keys(u.achievements || {}).length
    };
  });
  let me = null;
  if (req.user) {
    const ahead = await User.countDocuments({ xp: { $gt: req.user.xp } });
    me = { rank: ahead + 1, xp: req.user.xp };
  }
  res.json({ players: await User.estimatedDocumentCount(), rows, me });
}

async function changePassword(req, res) {
  const { current, next } = req.body || {};
  if (typeof next !== "string" || next.length < 6 || next.length > 100) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  // 400 (not 401): a 401 would make the client think the session expired and log out.
  if (!(await bcrypt.compare(String(current || ""), req.user.passwordHash))) {
    return res.status(400).json({ error: "Current password is wrong" });
  }
  req.user.passwordHash = await bcrypt.hash(next, 10);
  req.user.passwordChangedAt = new Date();
  await req.user.save();
  // Other devices are signed out; this one gets a fresh token.
  res.json({ ok: true, token: signToken(req.user) });
}

// Add or change the recovery email. Needs the password, so a borrowed phone can't hijack recovery.
async function updateEmail(req, res) {
  const { email, password } = req.body || {};
  if (!(await bcrypt.compare(String(password || ""), req.user.passwordHash))) {
    return res.status(400).json({ error: "Password is wrong" });
  }
  const mail = String(email || "").trim().toLowerCase();
  if (!mail) {
    req.user.email = undefined;
  } else {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail) || mail.length > 254) {
      return res.status(400).json({ error: "That email address doesn't look right" });
    }
    if (await User.exists({ email: mail, _id: { $ne: req.user._id } })) {
      return res.status(409).json({ error: "That email is already linked to another account" });
    }
    req.user.email = mail;
  }
  await req.user.save();
  res.json({ profile: req.user.toProfile() });
}

// Top 10 best scores on one case.
async function caseLeaderboard(req, res) {
  const id = String(req.params.caseId || "");
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) return res.status(400).json({ error: "Bad case id" });
  const field = "cases." + id;
  const users = await User.find({ [field + ".solves"]: { $gt: 0 } })
    .sort({ [field + ".best"]: -1, updatedAt: 1 })
    .limit(10)
    .lean();
  res.json({
    caseId: id,
    rows: users.map((u, i) => ({
      rank: i + 1,
      id: u._id.toString(),
      name: u.displayName,
      username: u.username,
      best: u.cases[id].best,
      stars: u.cases[id].stars
    }))
  });
}

// Permanently delete the player's account and saved games. Needs the password.
// Cases they generated stay playable for everyone (shown as created by "a former detective").
async function deleteAccount(req, res) {
  const { password } = req.body || {};
  if (!(await bcrypt.compare(String(password || ""), req.user.passwordHash))) {
    return res.status(400).json({ error: "Password is wrong" });
  }
  const CustomCase = require("../models/CustomCase");
  await Progress.deleteMany({ user: req.user._id });
  await CustomCase.updateMany({ createdBy: req.user._id }, { $set: { createdBy: null, creatorName: "a former detective" } });
  await req.user.deleteOne();
  res.json({ ok: true });
}

module.exports = { getState, saveProgress, saveBoard, resetProgress, updateProfile, recordEvent, leaderboard, changePassword, updateEmail, deleteAccount, caseLeaderboard };
