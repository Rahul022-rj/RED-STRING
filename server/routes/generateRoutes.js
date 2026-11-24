const express = require("express");
const router = express.Router();
const wrap = require("../middleware/wrap");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/generateController");

router.post("/", wrap(requireAuth), wrap(ctrl.generateCase));
router.get("/", wrap(ctrl.listCustom));
router.delete("/:id", wrap(requireAuth), wrap(ctrl.deleteCustomCase));

module.exports = router;
