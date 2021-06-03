const express = require("express");

const networkControllers = require("../controllers/network.controllers");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

//Network Details
router.get("/details", networkControllers.getNetworkDetails);

module.exports = router;
