const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/gameController");

router.get("/", ctrl.getCases);
router.get("/:id", ctrl.getCaseById);
router.get("/:id/suspects", ctrl.getSuspects);
router.get("/:id/evidence", ctrl.getEvidence);

module.exports = router;
