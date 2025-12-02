// src/models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: String,
  qty: Number,
  total: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
