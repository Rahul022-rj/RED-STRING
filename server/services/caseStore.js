const builtIn = require("../data/cases");
const CustomCase = require("../models/CustomCase");

function fromDoc(doc) {
  return { ...doc.data, id: doc.caseId, custom: true, author: doc.creatorName, authorId: doc.createdBy ? doc.createdBy.toString() : null };
}

async function findCase(id) {
  const c = builtIn.find((x) => x.id === id);
  if (c) return c;
  const doc = await CustomCase.findOne({ caseId: id }).lean();
  return doc ? fromDoc(doc) : null;
}

async function listCases() {
  const docs = await CustomCase.find().sort({ createdAt: -1 }).limit(200).lean();
  return [...builtIn, ...docs.map(fromDoc)];
}

function publicCase(c) {
  const { _solution, ...pub } = c;
  return pub;
}

module.exports = { findCase, listCases, publicCase };
