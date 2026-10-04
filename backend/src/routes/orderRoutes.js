const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// All order operations require authentication
router.use(authenticate);

// Customer & Admin endpoints
router.post('/', orderController.checkout);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);

// Admin-only order status transition
router.patch('/:id/status', authorizeRoles('ADMIN'), orderController.updateStatus);

module.exports = router;
