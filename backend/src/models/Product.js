// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String }, // path to uploaded image
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 1 });

module.exports = mongoose.model('Product', productSchema);
