const express = require("express");
const router = express.Router();

// Try to load the controller and show what we got (for debugging)
const productCtrl = require("../controllers/products.controller");
console.log("DEBUG: products.routes -> productCtrl keys:", Object.keys(productCtrl));
console.log("DEBUG: typeof createProduct:", typeof productCtrl.createProduct);

// small guard to give an explicit error message instead of Express's generic one
if (!productCtrl || typeof productCtrl.createProduct !== "function") {
  throw new Error("products.routes: productCtrl.createProduct is not a function. Check src/controllers/products.controller.js exports and filename (case sensitive).");
}

const auth = require("../middleware/auth");

// FARMER ROUTES
router.post("/add", auth, productCtrl.createProduct);
router.get("/my-products", auth, productCtrl.myProducts);
router.delete("/delete/:id", auth, productCtrl.deleteProduct);
router.put("/stock/:id", auth, productCtrl.updateStock);

// CONSUMER ROUTES
router.get("/all", productCtrl.listAll);

module.exports = router;
