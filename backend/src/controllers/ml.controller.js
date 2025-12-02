// src/controllers/ml.controller.js
const mlClient = require('../utils/mlClient');
const fs = require('fs');

exports.quality = async (req, res, next) => {
  try {
    const sensorValues = req.body; // expect JSON with sensor fields
    const imagePath = req.file ? req.file.path : null;
    const out = await mlClient.predictQuality({ imagePath, sensorValues });
    res.json(out);
  } catch (err) { next(err); }
};

exports.predictPrice = async (req, res, next) => {
  try {
    const sensorValues = req.body;
    const imagePath = req.file ? req.file.path : null;
    const out = await mlClient.predictPrice({ sensorValues, imagePath });
    res.json(out);
  } catch (err) { next(err); }
};

exports.predictYield = async (req, res, next) => {
  try {
    const sensorValues = req.body;
    const out = await mlClient.predictYield({ sensorValues });
    res.json(out);
  } catch (err) { next(err); }
};
