const express = require("express");
const router = express.Router();
const productCtrl = require("../controllers/products.controller.js");
const auth = require("../middleware/auth");

// FARMER
router.post("/add", auth, productCtrl.createProduct);
router.get("/my-products", auth, productCtrl.myProducts);
router.delete("/delete/:id", auth, productCtrl.deleteProduct);
router.put("/stock/:id", auth, productCtrl.updateStock);

// CONSUMER
router.get("/all", productCtrl.listAll);

module.exports = router;
