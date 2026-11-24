const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const wrap = require("../middleware/wrap");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/authController");

// Slow down password guessing.
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.post("/register", limiter, wrap(ctrl.register));
router.post("/login", limiter, wrap(ctrl.login));
// Recovery emails: a tighter limit so the form can't be used to spam someone's inbox.
const mailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests. Try again in an hour." } });

router.post("/forgot-password", mailLimiter, wrap(ctrl.forgotPassword));
router.post("/forgot-username", mailLimiter, wrap(ctrl.forgotUsername));
router.post("/reset-password", limiter, wrap(ctrl.resetPassword));
router.get("/me", wrap(requireAuth), wrap(ctrl.me));

module.exports = router;
