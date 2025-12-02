// src/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      qty: Number,
      price: Number
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ['PENDING','ACCEPTED','REJECTED','COMPLETED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Order', orderSchema);
