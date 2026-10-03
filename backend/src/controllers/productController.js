const productService = require("../services/productService");

const getProducts = async (req, res, next) => {
  try {
    const { search, category, page, limit } = req.query;
    const result = await productService.getAllProducts({
      search,
      category,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: result.products,
      meta: result.meta,
    });
  } catch (error) {
    next(error); // Passes to centralized errorHandler
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    // Basic validation
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, and category are required",
      });
    }

    const newProduct = await productService.createProduct({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedProduct = await productService.updateProduct(id, req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
