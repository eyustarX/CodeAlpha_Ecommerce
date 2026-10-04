const orderService = require('../services/orderService');

const checkout = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    const order = await orderService.createOrderFromCart(req.user.id, shippingAddress);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const orders = await orderService.getUserOrders(req.user.id, isAdmin);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'ADMIN';
    const order = await orderService.getOrderById(id, req.user.id, isAdmin);

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await orderService.updateOrderStatus(id, status);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getOrders,
  getOrder,
  updateStatus,
};
