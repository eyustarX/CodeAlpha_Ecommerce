const cartService = require('../services/cartService');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCartByUser(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    const item = await cartService.addToCart(req.user.id, productId, quantity || 1);
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const updateItemQuantity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required.',
      });
    }

    const result = await cartService.updateCartItemQuantity(req.user.id, id, quantity);
    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await cartService.removeCartItem(req.user.id, id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const clearAll = async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.user.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  deleteItem,
  clearAll,
};
