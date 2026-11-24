const express = require("express");
const router = express.Router();
const wrap = require("../middleware/wrap");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/meController");

router.use(wrap(requireAuth));
router.get("/state", wrap(ctrl.getState));
router.put("/progress/:caseId", wrap(ctrl.saveProgress));
router.delete("/progress/:caseId", wrap(ctrl.resetProgress));
router.put("/board/:caseId", wrap(ctrl.saveBoard));
router.put("/profile", wrap(ctrl.updateProfile));
router.post("/event", wrap(ctrl.recordEvent));

module.exports = router;
