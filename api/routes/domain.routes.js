const express = require("express");

const domainControllers = require("../controllers/domain.controllers");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

//Check Reservation Time
router.post("/checkTime", checkAuth, domainControllers.checkReservationTime);

//Reserve Domain
router.post("/reserve", checkAuth, domainControllers.reserveDomain);

//isDomainNameReserved
router.post("/isReserved", checkAuth, domainControllers.isDomainNameReserved);

module.exports = router;
