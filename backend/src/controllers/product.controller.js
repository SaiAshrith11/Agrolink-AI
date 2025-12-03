const Product = require('../models/Product');
const Joi = require('joi');

// CREATE PRODUCT
exports.createProduct = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      qty: Joi.number().positive().required(),
      price: Joi.number().positive().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const product = new Product({
      farmer: req.user.id,
      name: value.name,
      qty: value.qty,
      price: value.price,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// LIST ALL PRODUCTS
exports.listAll = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET MY PRODUCTS
exports.myProducts = async (req, res, next) => {
  try {
    const list = await Product.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// UPDATE STOCK
exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    const product = await Product.findOne({ _id: id, farmer: req.user.id });
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.qty = qty;
    await product.save();

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.deleteOne();

    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};
