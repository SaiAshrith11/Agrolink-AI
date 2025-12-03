// src/routes/products.routes.js
const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/products.controller');
const { auth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload dir
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOAD_DIR); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/', auth, requireRole('farmer'), upload.single('image'), productCtrl.createProduct);
router.get('/mine', auth, requireRole('farmer'), productCtrl.listByFarmer);
router.get('/', productCtrl.listAll);
router.put('/:id/stock', auth, requireRole('farmer'), productCtrl.updateStock);
router.delete('/:id', auth, productCtrl.deleteProduct);
// after other imports
router.get('/my', auth, productCtrl.myProducts);

module.exports = router;
