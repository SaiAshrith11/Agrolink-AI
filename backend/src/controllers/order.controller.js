// src/controllers/order.controller.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const Sale = require('../models/sale');
const Joi = require('joi');

exports.placeOrder = async (req, res, next) => {
  try {
    // consumer places order; body: items: [{ productId, qty }]
    const schema = Joi.object({
      items: Joi.array().items(Joi.object({
        productId: Joi.string().required(),
        qty: Joi.number().positive().required()
      })).min(1).required()
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const consumer = req.user.id;
    // map items -> fetch product infos
    const populated = [];
    let total = 0;
    let farmerId = null;
    for (const it of value.items) {
      const p = await Product.findById(it.productId);
      if (!p) return res.status(404).json({ error: `Product ${it.productId} not found` });
      if (farmerId && farmerId.toString() !== p.farmer.toString()) {
        // currently we assume single-farmer order — if multi-farmer you may split into multiple orders.
        return res.status(400).json({ error: 'All products in a single order must be from the same farmer' });
      }
      farmerId = p.farmer;
      const qty = Math.min(it.qty, p.qty); // not allowing more than available
      const subtotal = qty * p.price;
      populated.push({ product: p._id, name: p.name, qty, price: p.price });
      total += subtotal;
    }

    const order = await Order.create({
      consumer,
      farmer: farmerId,
      items: populated,
      total
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getOrdersForFarmer = async (req, res, next) => {
  try {
    const orders = await Order.find({ farmer: req.user.id }).sort({ createdAt: -1 }).limit(100).populate('consumer', 'username');
    res.json(orders);
  } catch (err) { next(err); }
};

exports.getOrdersForConsumer = async (req, res, next) => {
  try {
    const orders = await Order.find({ consumer: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (err) { next(err); }
};

exports.acceptOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, farmer: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'PENDING') return res.status(400).json({ error: 'Order already processed' });

    // reduce stock and create sales records
    for (const item of order.items) {
      const p = await Product.findById(item.product);
      if (p) {
        p.qty = Math.max(0, p.qty - item.qty);
        await p.save();

        await Sale.create({
          farmer: req.user.id,
          productName: item.name,
          qty: item.qty,
          total: (item.qty * item.price)
        });
      }
    }

    order.status = 'ACCEPTED';
    order.updatedAt = new Date();
    await order.save();

    res.json(order);
  } catch (err) { next(err); }
};
