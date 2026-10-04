const prisma = require('../config/prisma');

/**
 * Create order from user's cart using an ACID transaction
 */
const createOrderFromCart = async (userId, shippingAddress) => {
  if (!shippingAddress || !shippingAddress.trim()) {
    const error = new Error('Shipping address is required.');
    error.statusCode = 400;
    throw error;
  }

  // Use interactive Prisma transaction to guarantee atomic checkout
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch user's cart items with product details
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (!cartItems || cartItems.length === 0) {
      const error = new Error('Your cart is empty.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate stock and calculate total
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        const error = new Error(
          `Insufficient inventory for "${item.product.name}". Available: ${item.product.stock}, in cart: ${item.quantity}.`
        );
        error.statusCode = 400;
        throw error;
      }
      totalAmount += item.product.price * item.quantity;
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // 3. Create the Order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress: shippingAddress.trim(),
        status: 'PENDING',
      },
    });

    // 4. Create OrderItems (snapshot prices) and deduct inventory
    for (const item of cartItems) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price, // Historical price snapshot!
        },
      });

      // Deduct product stock
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 5. Clear the cart
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    // Return the newly created order with items
    return await tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                category: true,
              },
            },
          },
        },
      },
    });
  });
};

/**
 * Get orders for a user (or all orders if admin)
 */
const getUserOrders = async (userId, isAdmin = false) => {
  const where = isAdmin ? {} : { userId };

  return await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get single order details
 */
const getOrderById = async (orderId, userId, isAdmin = false) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check
  if (!isAdmin && order.userId !== userId) {
    const error = new Error('Access denied to this order.');
    error.statusCode = 403;
    throw error;
  }

  return order;
};

/**
 * Update order status (Admin only)
 */
const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};

module.exports = {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
};
