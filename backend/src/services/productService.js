const prisma = require("../config/prisma");

/**
 * Get all products with search, category filter, and pagination
 */
const getAllProducts = async ({ search, category, page = 1, limit = 10 }) => {
  const pageNumber = Math.max(1, parseInt(page, 10));
  const pageSize = Math.max(1, parseInt(limit, 10));
  const skip = (pageNumber - 1) * pageSize;

  // Construct dynamic Prisma WHERE clause
  const where = {};

  if (category) {
    where.category = {
      equals: category,
      mode: "insensitive", // Case-insensitive matching
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Run total count and paginated query in parallel for speed
  const [totalItems, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    products,
    meta: {
      page: pageNumber,
      limit: pageSize,
      totalItems,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  };
};

/**
 * Get single product by ID
 */
const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

/**
 * Create a new product
 */
const createProduct = async (data) => {
  const { name, description, price, stock, category, imageUrl } = data;

  return await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 0,
      category,
      imageUrl,
    },
  });
};

/**
 * Update an existing product
 */
const updateProduct = async (id, data) => {
  // Check if product exists first
  await getProductById(id);

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.stock !== undefined) updateData.stock = parseInt(data.stock, 10);
  if (data.category !== undefined) updateData.category = data.category;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

  return await prisma.product.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete a product
 */
const deleteProduct = async (id) => {
  await getProductById(id);

  return await prisma.product.delete({
    where: { id },
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
