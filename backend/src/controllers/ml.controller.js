const axios = require("axios");
const Prediction = require("../models/Prediction");

const ML_SERVICE_URL = "https://agrolink-ai-2.onrender.com";

exports.analyzeCrop = async (req, res) => {
  try {
    const user = req.user;
    const {
      cropType,
      moisture,
      temperature,
      npk,
      ph,
      humidity
    } = req.body;

    // Call ML Render API
    const response = await axios.post(`${ML_SERVICE_URL}/analyze`, {
      cropType,
      moisture,
      temperature,
      npk,
      ph,
      humidity
    });

    const result = response.data;

    // Save ML results into DB history
    const saved = await Prediction.create({
      userId: user._id,
      cropType,
      sensors: { moisture, temperature, npk, ph, humidity },
      yieldPercent: result.yieldPercent,
      price: result.price,
      fertilizerSuggestion: result.fertilizerSuggestion,
      quality: result.quality
    });

    res.json({
      success: true,
      message: "Prediction done",
      result: saved
    });

  } catch (err) {
    console.error("ML Service Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: "ML service failed" });
  }
};
