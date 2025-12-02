// src/routes/orders.routes.js
const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', auth, requireRole('consumer'), orderCtrl.placeOrder);
router.get('/consumer', auth, requireRole('consumer'), orderCtrl.getOrdersForConsumer);
router.get('/farmer', auth, requireRole('farmer'), orderCtrl.getOrdersForFarmer);
router.put('/:id/accept', auth, requireRole('farmer'), orderCtrl.acceptOrder);

module.exports = router;
