// src/controllers/sale.controller.js
const Sale = require('../models/sale');

exports.listRecent = async (req, res, next) => {
  try {
    const sales = await Sale.find({ farmer: req.user.id }).sort({ date: -1 }).limit(5);
    res.json(sales);
  } catch (err) { next(err); }
};
