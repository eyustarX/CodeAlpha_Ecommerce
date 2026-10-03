const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected route (requires valid JWT token)
router.get("/me", authenticate, authController.getMe);

module.exports = router;
