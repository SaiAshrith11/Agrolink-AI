const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  temperature: Number,
  moisture: Number,
  npk: Number,
  ph: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Sensor", sensorSchema);
