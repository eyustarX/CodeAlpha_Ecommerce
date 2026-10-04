const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Public catalog routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Admin-only product mutation routes
router.post("/", authenticate, authorizeRoles("ADMIN"), productController.createProduct);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), productController.updateProduct);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), productController.deleteProduct);

module.exports = router;
