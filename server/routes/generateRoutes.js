const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/generateController");

router.post("/", ctrl.generateCase);
router.get("/", ctrl.listCustom);
router.delete("/:id", ctrl.deleteCustomCase);

module.exports = router;
