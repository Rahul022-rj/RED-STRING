const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/gameController");

router.post("/accuse", ctrl.accuse);
router.post("/hint", ctrl.hint);
router.post("/score", ctrl.score);

module.exports = router;
