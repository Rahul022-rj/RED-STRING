const fs = require("fs");
const path = require("path");
const cases = require("../data/cases");

const CUSTOM_FILE = path.join(__dirname, "..", "data", "customCases.json");

function allCases() {
  let custom = [];
  try {
    custom = JSON.parse(fs.readFileSync(CUSTOM_FILE, "utf8"));
  } catch {
    custom = [];
  }
  return [...cases, ...custom];
}

function publicCase(c) {
  const { _solution, ...pub } = c;
  return pub;
}

function getCases(req, res) {
  const list = allCases().map((c) => ({
    id: c.id, number: c.number, title: c.title, location: c.location,
    difficulty: c.difficulty, description: c.description, custom: !!c.custom
  }));
  res.json(list);
}

function getCaseById(req, res) {
  const c = allCases().find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  res.json(publicCase(c));
}

function getSuspects(req, res) {
  const c = allCases().find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  res.json(c.suspects);
}

function getEvidence(req, res) {
  const c = allCases().find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  res.json(c.evidence);
}

function accuse(req, res) {
  const { caseId, culpritId, supportingEvidence } = req.body || {};
  if (!caseId || !culpritId) return res.status(400).json({ error: "caseId and culpritId are required" });
  const c = allCases().find((x) => x.id === caseId);
  if (!c) return res.status(404).json({ error: "Case not found" });
  const correct = c._solution.culprit === culpritId;
  const keyEvidence = c._solution.keyEvidence || [];
  const selected = Array.isArray(supportingEvidence) ? supportingEvidence : [];
  const matches = selected.filter((id) => keyEvidence.includes(id)).length;
  const evidenceScore = matches * 50;
  const correctBonus = correct ? 200 : 0;
  res.json({
    correct,
    score: correctBonus + evidenceScore,
    solution: {
      culprit: c._solution.culprit,
      motive: c._solution.motive,
      method: c._solution.method,
      timeline: c._solution.timeline,
      keyEvidence: c._solution.keyEvidence,
      innocent: c._solution.innocent
    }
  });
}

function hint(req, res) {
  const { caseId, level } = req.body || {};
  if (!caseId || !level) return res.status(400).json({ error: "caseId and level required" });
  const c = allCases().find((x) => x.id === req.params.id || x.id === caseId);
  if (!c) return res.status(404).json({ error: "Case not found" });
  const index = Math.min(Math.max(level, 1), 3) - 1;
  res.json({ hint: c.hints[index], level });
}

function score(req, res) {
  const { correct, evidenceCount, connectionCount, hintsUsed } = req.body || {};
  let total = 0;
  if (correct) total += 200;
  total += (evidenceCount || 0) * 20;
  total += (connectionCount || 0) * 10;
  total -= (hintsUsed || 0) * 50;
  if (!correct) total = Math.max(total - 100, 0);
  let rank = "Rookie";
  if (total >= 500) rank = "Legendary Detective";
  else if (total >= 400) rank = "Master Detective";
  else if (total >= 300) rank = "Investigator";
  else if (total >= 150) rank = "Observer";
  res.json({ total: Math.max(total, 0), rank });
}

module.exports = { getCases, getCaseById, getSuspects, getEvidence, accuse, hint, score };
