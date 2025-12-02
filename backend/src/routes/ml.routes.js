// src/routes/ml.routes.js
const express = require('express');
const router = express.Router();
const mlCtrl = require('../controllers/ml.controller');
const { auth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/quality', auth, requireRole('farmer'), upload.single('image'), mlCtrl.quality);
router.post('/predict-price', auth, requireRole('farmer'), upload.single('image'), mlCtrl.predictPrice);
router.post('/predict-yield', auth, requireRole('farmer'), mlCtrl.predictYield);

module.exports = router;
