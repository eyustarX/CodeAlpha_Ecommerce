const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

// All cart endpoints require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:id', cartController.updateItemQuantity);
router.delete('/items/:id', cartController.deleteItem);
router.delete('/', cartController.clearAll);

module.exports = router;
