const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const CustomCase = require("../models/CustomCase");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/redstring";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("MongoDB connected:", mongoose.connection.host + "/" + mongoose.connection.name);
  await importLegacyCustomCases();
}

// One-time import of cases generated before the database existed.
async function importLegacyCustomCases() {
  const file = path.join(__dirname, "..", "data", "customCases.json");
  if (!fs.existsSync(file)) return;
  if ((await CustomCase.estimatedDocumentCount()) > 0) return;
  let list = [];
  try {
    list = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return;
  }
  for (const c of list) {
    await CustomCase.updateOne(
      { caseId: c.id },
      { $setOnInsert: { caseId: c.id, creatorName: "Archive", data: c } },
      { upsert: true }
    );
  }
  if (list.length) console.log("Imported " + list.length + " legacy custom case(s) into MongoDB");
}

module.exports = connectDB;
