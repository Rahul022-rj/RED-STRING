const mongoose = require("mongoose");

// A player-generated case, shared with everyone. `data` holds the full case
// including its `_solution`, which is stripped before sending to clients.
const customCaseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    creatorName: { type: String, default: "Unknown" },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model("CustomCase", customCaseSchema);
