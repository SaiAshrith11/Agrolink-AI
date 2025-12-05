// src/routes/sales.routes.js
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const saleCtrl = require('../controllers/sale.controller');

router.post('/create', auth, requireRole('farmer'), saleCtrl.createSale);
router.get('/recent', auth, requireRole('farmer'), saleCtrl.listRecent);
router.delete('/:id', auth, requireRole('farmer'), saleCtrl.deleteSale);

module.exports = router;
