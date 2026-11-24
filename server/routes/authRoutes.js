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
router.get("/me", wrap(requireAuth), wrap(ctrl.me));

module.exports = router;
