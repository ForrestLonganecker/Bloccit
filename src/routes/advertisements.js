const express = require("express");
const router = express.Router();

const advertismentController = require("../controllers/advertisementController");

router.get("/advertisements", advertismentController.index);

module.exports = router;