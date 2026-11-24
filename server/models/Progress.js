const mongoose = require("mongoose");

// One document per (player, case): the in-progress investigation and its board.
const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caseId: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    board: { type: mongoose.Schema.Types.Mixed, default: () => ({ positions: {}, connections: [] }) },
    // Hint levels the server actually handed out (the client can't erase these).
    hintsServed: { type: [Number], default: [] }
  },
  { timestamps: true, minimize: false }
);

progressSchema.index({ user: 1, caseId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
