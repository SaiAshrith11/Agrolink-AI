// src/controllers/ml.controller.js
// NOTE: this is a demo "ML" controller.
// You can later replace the formulas with real ML model calls (Python API etc).

// Tiny helper to convert to number safely
function num(x, fallback = 0) {
  const v = Number(x);
  return Number.isFinite(v) ? v : fallback;
}

// Fake "model" that uses only sensors
function runModels({ moisture, temperature, npk, ph, humidity }) {
  moisture = num(moisture, 40);
  temperature = num(temperature, 28);
  npk = num(npk, 350);
  ph = num(ph, 6.8);
  humidity = num(humidity, 50);

  // ---- YIELD (0–100%) ----
  let yieldScore = 0;
  if (moisture >= 35 && moisture <= 55) yieldScore += 30;
  if (temperature >= 20 && temperature <= 32) yieldScore += 30;
  if (ph >= 6 && ph <= 7.5) yieldScore += 20;
  if (npk >= 300 && npk <= 600) yieldScore += 20;
  const yieldPercent = Math.round(yieldScore);

  // ---- PRICE (₹ / kg) ----
  const basePrice = 20;
  const price =
    Math.round(
      basePrice +
        (temperature * 0.5) +
        (moisture * 0.2) +
        (npk / 50) +
        (ph * 2)
    );

  // ---- FERTILIZER SUGGESTION ----
  let fertilizerSuggestion = "Balanced NPK recommended.";
  if (npk < 280) {
    fertilizerSuggestion = "Add Nitrogen-rich fertilizer (low NPK).";
  } else if (npk > 650) {
    fertilizerSuggestion = "Reduce NPK; soil is already nutrient rich.";
  }
  if (moisture < 30) {
    fertilizerSuggestion += " Also irrigate – moisture is very low.";
  } else if (moisture > 70) {
    fertilizerSuggestion += " Avoid over-irrigation – moisture is high.";
  }

  // ---- QUALITY (LOW / MEDIUM / HIGH) ----
  let qualityScore = 0;
  if (yieldPercent >= 60) qualityScore++;
  if (moisture >= 35 && moisture <= 60) qualityScore++;
  if (npk >= 300 && npk <= 600) qualityScore++;
  if (ph >= 6 && ph <= 7.2) qualityScore++;

  let quality = "LOW";
  if (qualityScore >= 3) quality = "HIGH";
  else if (qualityScore === 2) quality = "MEDIUM";

  return {
    yieldPercent,
    price,
    fertilizerSuggestion,
    quality,
  };
}

exports.analyzeCrop = async (req, res, next) => {
  try {
    // sensors come either from body (JSON) or from form-data
    const {
      moisture,
      temperature,
      npk,
      ph,
      humidity,
      cropType,
    } = req.body;

    const sensors = { moisture, temperature, npk, ph, humidity };
    const result = runModels(sensors);

    // image file (optional, for your future CV model)
    const imageFile = req.file ? `/uploads/${req.file.filename}` : null;

    res.json({
      success: true,
      cropType: cropType || null,
      image: imageFile,
      sensors: {
        moisture: num(moisture),
        temperature: num(temperature),
        npk: num(npk),
        ph: num(ph),
        humidity: num(humidity),
      },
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
