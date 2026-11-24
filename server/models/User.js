const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema(
  {
    accusations: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    breaks: { type: Number, default: 0 },
    evidenceFound: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    generated: { type: Number, default: 0 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true, maxlength: 24 },
    passwordHash: { type: String, required: true },
    // Optional, used only for account recovery. Never shown to other players.
    email: { type: String, lowercase: true, trim: true, maxlength: 254, unique: true, sparse: true },
    // Password reset: only a SHA-256 hash of the emailed token is stored.
    resetTokenHash: { type: String, index: true },
    resetTokenExpires: { type: Date },
    // Login tokens issued before this moment are rejected (signs out old sessions).
    passwordChangedAt: { type: Date },
    xp: { type: Number, default: 0, index: true },
    stats: { type: statsSchema, default: () => ({}) },
    // achievementId -> unlock date (ISO string)
    achievements: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    // caseId -> { best, stars, solves, attempts }
    cases: { type: mongoose.Schema.Types.Mixed, default: () => ({}) }
  },
  { timestamps: true, minimize: false }
);

userSchema.methods.toProfile = function () {
  return {
    id: this._id.toString(),
    username: this.username,
    name: this.displayName,
    email: this.email || null,
    xp: this.xp,
    stats: this.stats ? this.stats.toObject() : {},
    achievements: this.achievements || {},
    cases: this.cases || {},
    joined: this.createdAt
  };
};

module.exports = mongoose.model("User", userSchema);
