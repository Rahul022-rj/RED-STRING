const CustomCase = require("../models/CustomCase");
const Progress = require("../models/Progress");
const { generateCaseWithAI, THEMES } = require("../services/caseGenerator");
const { grant } = require("../services/progression");

async function generateCase(req, res) {
  const { theme, difficulty, tone } = req.body || {};
  const themeKey = String(theme || "museum").toLowerCase();
  const diff = ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium";
  const toneText = (tone && String(tone).trim().slice(0, 80)) || "tense";

  if (!THEMES[themeKey] && !process.env.OPENAI_API_KEY) {
    return res.status(400).json({ error: "Unknown theme and no AI key configured.", allowedThemes: Object.keys(THEMES) });
  }

  const generated = await generateCaseWithAI({ themeKey, difficulty: diff, tone: toneText });

  // Make sure the id is unique across everyone's cases.
  let id = generated.id;
  for (let i = 0; (await CustomCase.exists({ caseId: id })) && i < 20; i++) {
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    id = "case-" + num;
    generated.number = num;
  }
  generated.id = id;

  await CustomCase.create({
    caseId: id,
    createdBy: req.user._id,
    creatorName: req.user.displayName,
    data: generated
  });

  req.user.stats.generated += 1;
  const unlocked = grant(req.user, "architect") ? ["architect"] : [];
  await req.user.save();

  const { _solution, ...pub } = generated;
  res.status(201).json({ case: pub, id, unlocked, profile: req.user.toProfile() });
}

async function listCustom(req, res) {
  const docs = await CustomCase.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json(docs.map((d) => ({
    id: d.caseId, number: d.data.number, title: d.data.title, location: d.data.location,
    difficulty: d.data.difficulty, description: d.data.description, custom: true, author: d.creatorName
  })));
}

// Only the player who generated a case can delete it.
async function deleteCustomCase(req, res) {
  const doc = await CustomCase.findOne({ caseId: req.params.id });
  if (!doc) return res.status(404).json({ error: "Custom case not found" });
  if (!doc.createdBy || !doc.createdBy.equals(req.user._id)) {
    return res.status(403).json({ error: "Only the detective who created this case can delete it" });
  }
  await doc.deleteOne();
  await Progress.deleteMany({ caseId: req.params.id });
  res.json({ success: true, id: req.params.id });
}

module.exports = { generateCase, listCustom, deleteCustomCase };
