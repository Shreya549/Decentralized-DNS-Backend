const express = require("express");

const domainControllers = require("../controllers/domain.controllers");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

//User signup
router.post("/checkTime", checkAuth, domainControllers.checkReservationTime);

//User login
// router.post("/login", domainControllers.login);

module.exports = router;
