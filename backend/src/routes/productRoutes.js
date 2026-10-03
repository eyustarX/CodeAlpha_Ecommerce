const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Public catalog routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Management routes (We will attach admin auth middleware here in Phase 11)
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
