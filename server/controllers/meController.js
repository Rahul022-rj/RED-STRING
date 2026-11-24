const Progress = require("../models/Progress");
const User = require("../models/User");
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

module.exports = { getState, saveProgress, saveBoard, resetProgress, updateProfile, recordEvent, leaderboard };
