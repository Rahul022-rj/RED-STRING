const Progress = require("../models/Progress");
const { findCase, listCases, publicCase } = require("../services/caseStore");
const { HOURS, MAX_CITED, scoreAccusation, applyAccusation } = require("../services/progression");

async function getCases(req, res) {
  const list = (await listCases()).map((c) => ({
    id: c.id, number: c.number, title: c.title, location: c.location,
    difficulty: c.difficulty, description: c.description,
    custom: !!c.custom, author: c.author || null, authorId: c.authorId || null
  }));
  res.json(list);
}

async function getCaseById(req, res) {
  const c = await findCase(req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  res.json(publicCase(c));
}

async function getSuspects(req, res) {
  const c = await findCase(req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  res.json(c.suspects);
}

async function getEvidence(req, res) {
  const c = await findCase(req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  res.json(c.evidence);
}

// The accusation is scored entirely from what the server has stored for this
// player (discovered evidence, hours, hints, board), not from the request.
async function accuse(req, res) {
  const { caseId, culpritId, supportingEvidence, theory } = req.body || {};
  if (!caseId || !culpritId) return res.status(400).json({ error: "caseId and culpritId are required" });
  const c = await findCase(caseId);
  if (!c) return res.status(404).json({ error: "Case not found" });
  if (!c.suspects.some((s) => s.id === culpritId)) return res.status(400).json({ error: "Unknown suspect" });

  const prog = await Progress.findOne({ user: req.user._id, caseId });
  const data = (prog && prog.data) || {};
  if (!data.started) return res.status(400).json({ error: "Take the case before accusing anyone" });
  if (data.completed) return res.status(409).json({ error: "This case is already closed. Replay it to accuse again." });

  const validEv = new Set(c.evidence.map((e) => e.id));
  const discovered = [...new Set(Array.isArray(data.discovered) ? data.discovered : [])].filter((id) => validEv.has(id));
  const cited = [...new Set(Array.isArray(supportingEvidence) ? supportingEvidence : [])]
    .filter((id) => discovered.includes(id))
    .slice(0, MAX_CITED);
  const connections = ((prog.board && prog.board.connections) || [])
    .filter((x) => x && typeof x.a === "string" && typeof x.b === "string")
    .slice(0, 60);
  const hintsUsed = Math.min(3, Math.max(prog.hintsServed.length, Object.keys(data.hints || {}).length));
  const hoursTotal = HOURS[c.difficulty] || 13;
  const hoursLeft = Math.max(0, Math.min(hoursTotal, hoursTotal - (Number(data.hoursUsed) || 0)));

  const result = scoreAccusation(c, { culpritId, cited, discovered, connections, hintsUsed, hoursLeft });
  const { reward, unlocked } = applyAccusation(req.user, {
    caseId,
    result,
    difficulty: c.difficulty,
    hintsUsed,
    hoursLeft,
    hoursTotal,
    discovered: discovered.length,
    totalEvidence: c.evidence.length,
    connections: connections.length
  });
  await req.user.save();

  prog.data = {
    ...data,
    completed: true,
    result,
    reward,
    theory: String(theory || "").slice(0, 2000),
    accusedAt: new Date().toISOString()
  };
  prog.markModified("data");
  await prog.save();

  res.json({ ...result, reward, unlocked, progress: prog.data, profile: req.user.toProfile() });
}

async function hint(req, res) {
  const { caseId, level } = req.body || {};
  if (!caseId || !level) return res.status(400).json({ error: "caseId and level required" });
  const c = await findCase(caseId);
  if (!c) return res.status(404).json({ error: "Case not found" });
  const lvl = Math.min(3, Math.max(1, Math.floor(Number(level) || 1)));

  const prog = await Progress.findOneAndUpdate(
    { user: req.user._id, caseId },
    { $setOnInsert: { data: {}, board: { positions: {}, connections: [] } } },
    { upsert: true, new: true }
  );
  if (!prog.hintsServed.includes(lvl)) {
    prog.hintsServed.push(lvl);
    await prog.save();
    req.user.stats.hintsUsed += 1;
    await req.user.save();
  }
  res.json({ hint: c.hints[lvl - 1] || "Your informant has nothing more to say.", level: lvl, profile: req.user.toProfile() });
}

module.exports = { getCases, getCaseById, getSuspects, getEvidence, accuse, hint };
