const Sensor = require("../models/Sensor");

exports.logSensorData = async (req, res, next) => {
  try {
    const { temperature, moisture, npk, ph, humidity } = req.body;

    if (temperature == null || moisture == null) {
      return res.status(400).json({ error: "Missing required sensor fields (temperature, moisture)" });
    }

    const sensor = new Sensor({
      farmer: req.user.id,
      values: {
        temperature,
        moisture,
        npk: npk || null,
        ph: ph || (6 + Math.random() * 1.5).toFixed(1),
        humidity: humidity || null
      },
      recordedAt: new Date()
    });

    await sensor.save();
    res.status(201).json({ success: true, sensor });

  } catch (err) {
    console.error("Sensor Logging Error:", err);
    next(err);
  }
};
