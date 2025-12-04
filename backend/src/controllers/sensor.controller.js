const Sensor = require("../models/Sensor");

exports.logSensorData = async (req, res) => {
  try {
    const { temperature, moisture, npk } = req.body;

    if (temperature == null || moisture == null || npk == null) {
      return res.status(400).json({ error: "Missing sensor fields" });
    }

    const sensor = new Sensor({
      farmer: req.user.id,
      temperature,
      moisture,
      npk,
      ph: (6 + Math.random() * 1.5).toFixed(1), // auto pH when no sensor
      createdAt: new Date(),
    });

    await sensor.save();
    res.status(201).json({ success: true, sensor });

  } catch (err) {
    console.error("Sensor Logging Error:", err);
    res.status(500).json({ error: err.message });
  }
};
