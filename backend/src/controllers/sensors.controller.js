// src/controllers/sensor.controller.js
const Sensor = require('../models/Sensor');
const Joi = require('joi');

exports.ingest = async (req, res, next) => {
  try {
    const schema = Joi.object({
      moisture: Joi.number().required(),
      temperature: Joi.number().required(),
      humidity: Joi.number().optional(),
      ph: Joi.number().required(),
      npk: Joi.number().required()
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const record = await Sensor.create({
      farmer: req.user.id,
      values: value
    });
    res.status(201).json(record);
  } catch (err) { next(err); }
};

exports.latest = async (req, res, next) => {
  try {
    const latest = await Sensor.findOne({ farmer: req.user.id }).sort({ recordedAt: -1 }).limit(1);
    res.json(latest);
  } catch (err) { next(err); }
};
