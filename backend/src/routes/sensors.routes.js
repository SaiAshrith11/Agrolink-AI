// src/routes/sensors.routes.js
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const sensorCtrl = require('../controllers/sensors.controller');

router.post('/', auth, requireRole('farmer'), sensorCtrl.ingest);
router.get('/latest', auth, requireRole('farmer'), sensorCtrl.latest);

module.exports = router;
