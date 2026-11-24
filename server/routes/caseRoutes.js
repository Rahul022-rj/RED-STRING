const express = require("express");
const router = express.Router();
const wrap = require("../middleware/wrap");
const ctrl = require("../controllers/gameController");

router.get("/", wrap(ctrl.getCases));
router.get("/:id", wrap(ctrl.getCaseById));
router.get("/:id/suspects", wrap(ctrl.getSuspects));
router.get("/:id/evidence", wrap(ctrl.getEvidence));

module.exports = router;
