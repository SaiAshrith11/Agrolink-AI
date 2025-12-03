// src/controllers/sale.controller.js
const Sale = require('../models/sale');

exports.listRecent = async (req, res, next) => {
  try {
    const sales = await Sale.find({ farmer: req.user.id })
      .sort({ date: -1 })
      .limit(5);
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

exports.deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    await Sale.deleteOne({ _id: sale._id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
