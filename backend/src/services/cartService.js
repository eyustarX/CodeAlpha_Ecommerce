const prisma = require('../config/prisma');

/**
 * Get active cart for user, including populated product details and calculated totals
 */
const getCartByUser = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          imageUrl: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate cart totals
  let subtotal = 0;
  let totalItemsCount = 0;

  const formattedItems = items.map((item) => {
    const itemTotal = item.product.price * item.quantity;
    subtotal += itemTotal;
    totalItemsCount += item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      itemTotal: parseFloat(itemTotal.toFixed(2)),
    };
  });

  return {
    items: formattedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalItemsCount,
  };
};

/**
 * Add product to cart (or increment quantity if already present)
 */
const addToCart = async (userId, productId, quantity = 1) => {
  const qtyToAdd = Math.max(1, parseInt(quantity, 10));

  // 1. Verify product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Check existing cart item
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  const finalQuantity = existingCartItem ? existingCartItem.quantity + qtyToAdd : qtyToAdd;

  // 3. Stock validation
  if (finalQuantity > product.stock) {
    const error = new Error(`Cannot add ${qtyToAdd} items. Only ${product.stock} available in stock.`);
    error.statusCode = 400;
    throw error;
  }

  // 4. Upsert cart item
  if (existingCartItem) {
    return await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: finalQuantity },
      include: { product: true },
    });
  } else {
    return await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity: finalQuantity,
      },
      include: { product: true },
    });
  }
};

/**
 * Update quantity of an existing cart item
 */
const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
  const newQty = parseInt(quantity, 10);

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });

  if (!cartItem || cartItem.userId !== userId) {
    const error = new Error('Cart item not found.');
    error.statusCode = 404;
    throw error;
  }

  // If quantity <= 0, remove item
  if (newQty <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return { deleted: true, message: 'Item removed from cart' };
  }

  // Check stock
  if (newQty > cartItem.product.stock) {
    const error = new Error(`Only ${cartItem.product.stock} items available in stock.`);
    error.statusCode = 400;
    throw error;
  }

  return await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: newQty },
    include: { product: true },
  });
};

/**
 * Remove an item from the cart
 */
const removeCartItem = async (userId, cartItemId) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem || cartItem.userId !== userId) {
    const error = new Error('Cart item not found.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return { message: 'Item removed from cart' };
};

/**
 * Clear the entire cart for a user
 */
const clearCart = async (userId) => {
  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  return { message: 'Cart cleared successfully' };
};

module.exports = {
  getCartByUser,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
