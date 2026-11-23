const fs = require("fs");
const path = require("path");
const { generateCaseWithAI, THEMES } = require("../services/caseGenerator");

const CUSTOM_FILE = path.join(__dirname, "..", "data", "customCases.json");

function readCustom() {
  try {
    return JSON.parse(fs.readFileSync(CUSTOM_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeCustom(list) {
  fs.writeFileSync(CUSTOM_FILE, JSON.stringify(list, null, 2), "utf8");
}

async function generateCase(req, res) {
  const { theme, difficulty, tone } = req.body || {};
  const themeKey = String(theme || "museum").toLowerCase();
  const diff = ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium";
  const toneText = (tone && String(tone).trim().slice(0, 80)) || "tense";

  if (!THEMES[themeKey] && !process.env.OPENAI_API_KEY) {
    return res.status(400).json({
      error: "Unknown theme and no AI key configured.",
      allowedThemes: Object.keys(THEMES)
    });
  }

  try {
    const generated = await generateCaseWithAI({ themeKey, difficulty: diff, tone: toneText });
    const list = readCustom();
    list.push(generated);
    writeCustom(list);
    const { _solution, ...pub } = generated;
    res.status(201).json({ case: pub, id: generated.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
}

function listCustom(req, res) {
  const list = readCustom().map((c) => ({
    id: c.id, number: c.number, title: c.title, location: c.location,
    difficulty: c.difficulty, description: c.description, custom: true
  }));
  res.json(list);
}

function deleteCustomCase(req, res) {
  const id = req.params.id;
  const list = readCustom();
  const filtered = list.filter((c) => c.id !== id);

  if (list.length === filtered.length) {
    return res.status(404).json({ error: "Custom case not found" });
  }

  writeCustom(filtered);
  res.json({ success: true, id: id });
}

module.exports = { generateCase, listCustom, deleteCustomCase };
