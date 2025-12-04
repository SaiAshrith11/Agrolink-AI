const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const FormData = require("form-data");
const { auth } = require("../middleware/auth.js");

const router = express.Router();
const upload = multer();

const ML_URL = "https://agrolink-ai-2.onrender.com/analyze";

// POST /api/ml/analyze
router.post("/analyze", auth, upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();

    // Append sensor fields
    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }

    // Append image if sent
    if (req.file) {
      formData.append("image", req.file.buffer, req.file.originalname);
    }

    const mlResponse = await fetch(ML_URL, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await mlResponse.json();
    return res.json(result);

  } catch (err) {
    console.error("ML Analyze Error:", err);
    return res.status(500).json({ error: "Could not reach ML server" });
  }
});

module.exports = router;
