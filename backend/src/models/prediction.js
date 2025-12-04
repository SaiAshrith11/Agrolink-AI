const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cropType: { type: String, required: true },
    sensors: {
      moisture: Number,
      temperature: Number,
      npk: Number,
      ph: Number,
      humidity: Number,
    },
    yieldPercent: Number,
    price: Number,
    fertilizerSuggestion: String,
    quality: String,
    createdAt: { type: Date, default: Date.now }
  }
);

module.exports = mongoose.model("Prediction", PredictionSchema);
