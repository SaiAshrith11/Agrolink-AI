// src/controllers/product.controller.js
const Product = require('../models/Product');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// For image uploading we'll handle in routes via multer; controller receives req.file

exports.createProduct = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      qty: Joi.number().positive().required(),
      price: Joi.number().positive().required()
    });
    const body = req.body;
    const { error, value } = schema.validate(body);
    if (error) return res.status(400).json({ error: error.message });

    const product = new Product({
      farmer: req.user.id,
      name: value.name,
      qty: value.qty,
      price: value.price,
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.listByFarmer = async (req, res, next) => {
  try {
    const products = await Product.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.listAll = async (req, res, next) => {
  try {
    // Optionally filter by region etc. For now return all
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;
    if (typeof qty !== 'number') return res.status(400).json({ error: 'qty must be number' });
    const product = await Product.findOne({ _id: id, farmer: req.user.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.qty = qty;
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
// backend/src/controllers/products.controller.js
const Product = require('../models/Product');

/**
 * DELETE /api/products/:id
 * Only farmer who owns the product can delete it.
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user && req.user.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // check ownership
    if (product.farmer.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Forbidden — you can only delete your own products' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
// returns products created by the authenticated farmer
exports.myProducts = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const prods = await Product.find({ farmer: userId }).sort({ createdAt: -1 });
    res.json(prods);
  } catch (err) {
    next(err);
  }
};

};
