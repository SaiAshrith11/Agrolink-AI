// src/controllers/ml.controller.js
const fetch = require("node-fetch");
const FormData = require("form-data");

const ML_SERVICE = process.env.ML_URL || "https://agrolink-ai-2.onrender.com/analyze";

exports.analyzeCrop = async (req, res, next) => {
  try {
    const form = new FormData();

    const {
      moisture,
      temperature,
      npk,
      ph,
      humidity,
      cropType
    } = req.body;

    form.append("moisture", moisture);
    form.append("temperature", temperature);
    form.append("npk", npk);
    form.append("ph", ph);
    form.append("humidity", humidity);
    form.append("cropType", cropType || "generic");

    if (req.file) {
      form.append("image", req.file.buffer, {
        filename: "crop.jpg",
        contentType: req.file.mimetype
      });
    }

    const response = await fetch(ML_SERVICE, {
      method: "POST",
      body: form
    });

    const data = await response.json();
    console.log("ML Service Response:", data);

    res.json({
      success: true,
      ...data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "ML Service failed" });
  }
};
