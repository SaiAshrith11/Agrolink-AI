// src/utils/mlClient.js
// This file provides helper functions to call your ML models or microservice.
// Right now returns simulated responses. Replace body with real inference call
// (e.g., call Python microservice, TensorFlow serving, or load model here).

exports.predictQuality = async ({ imagePath, sensorValues }) => {
  // TODO: call your model here
  return { quality: 'HIGH', confidence: 0.92 };
};

exports.predictPrice = async ({ sensorValues, imagePath }) => {
  // TODO: call your price model
  const est = Math.round((sensorValues.temperature * 2 + sensorValues.moisture + (sensorValues.npk / 20) + sensorValues.ph * 5) * 1.05);
  return { predicted_price: est, currency: 'INR' };
};

exports.predictYield = async ({ sensorValues }) => {
  const yp = Math.round((sensorValues.moisture + sensorValues.temperature + sensorValues.npk / 10) / 4);
  return { yield_pct: yp };
};
