const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const sensorCtrl = require("../controllers/sensor.controller");

// Log farm sensor data
router.post("/log", auth, sensorCtrl.logSensorData);

module.exports = router;
