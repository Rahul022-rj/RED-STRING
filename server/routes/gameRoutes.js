const express = require("express");
const router = express.Router();
const wrap = require("../middleware/wrap");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/gameController");

router.post("/accuse", wrap(requireAuth), wrap(ctrl.accuse));
router.post("/hint", wrap(requireAuth), wrap(ctrl.hint));

module.exports = router;
