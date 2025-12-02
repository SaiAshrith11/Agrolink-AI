// src/models/Sensor.js
const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  values: {
    moisture: Number,
    temperature: Number,
    humidity: Number,
    ph: Number,
    npk: Number
  },
  recordedAt: { type: Date, default: Date.now }
});

sensorSchema.index({ farmer: 1, recordedAt: -1 });

module.exports = mongoose.model('Sensor', sensorSchema);
