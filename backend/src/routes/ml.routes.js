// src/routes/ml.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { auth } = require("../middleware/auth");
const mlCtrl = require("../controllers/ml.controller");

// === Multer setup for image upload ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/ml/analyze
// Body: form-data with fields: moisture, temperature, npk, ph, humidity, cropType, and file 'image'
router.post(
  "/analyze",
  auth,
  upload.single("image"),   // image is optional but supported
  mlCtrl.analyzeCrop
);

module.exports = router;
