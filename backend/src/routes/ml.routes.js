const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const FormData = require("form-data");
const { auth } = require("../middleware/auth");

const router = express.Router();
const upload = multer();

const ML_URL = process.env.ML_URL || "https://agrolink-ai-2.onrender.com/analyze";

// POST /api/ml/analyze
router.post("/analyze", auth, upload.single("image"), async (req, res, next) => {
  try {
    const formData = new FormData();

    // Append sensor fields from body
    const { moisture, temperature, npk, ph, humidity, cropType } = req.body;
    
    if (moisture) formData.append("moisture", moisture);
    if (temperature) formData.append("temperature", temperature);
    if (npk) formData.append("npk", npk);
    if (ph) formData.append("ph", ph);
    if (humidity) formData.append("humidity", humidity);
    if (cropType) formData.append("cropType", cropType);

    // Append image if sent
    if (req.file) {
      formData.append("image", req.file.buffer, {
        filename: req.file.originalname || "crop.jpg",
        contentType: req.file.mimetype || "image/jpeg"
      });
    }

    const mlResponse = await fetch(ML_URL, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders()
    });

    if (!mlResponse.ok) {
      throw new Error(`ML service returned ${mlResponse.status}`);
    }

    const result = await mlResponse.json();
    
    // Return structured response matching frontend expectations
    return res.json({
      success: true,
      result: {
        price: result.price || result.predicted_price || 0,
        yieldPercent: result.yieldPercent || result.yield_pct || 0,
        fertilizerSuggestion: result.fertilizerSuggestion || result.fertilizer || "Balanced NPK recommended",
        quality: result.quality || "GOOD"
      },
      ...result
    });

  } catch (err) {
    console.error("ML Analyze Error:", err);
    return res.status(500).json({ 
      success: false,
      error: "Could not reach ML server",
      message: err.message 
    });
  }
});

module.exports = router;
