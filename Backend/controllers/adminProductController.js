import Product from "../models/Product.js";
import { logger } from "../utils/logger.js";

/**
 * Admin Product Controller
 * Handles product CRUD operations for admins only
 */

// Create a new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stockQuantity, unit, composition, bestFor, manufacturer, instructions, image } = req.body;

    // Validation
    if (!name || !description || !category || !price || stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, description, category, price, and stock quantity are required",
      });
    }

    // Create product
    const product = new Product({
      name,
      description,
      category,
      price,
      stockQuantity,
      unit: unit || "kg",
      composition,
      bestFor,
      manufacturer,
      instructions,
      image,
    });

    await product.save();

    logger.info("Product created", { productId: product._id, name: product.name });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    logger.error("Create product error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    logger.info("Product updated", { productId: id });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    logger.error("Update product error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    logger.info("Product deleted", { productId: id });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    logger.error("Delete product error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products (Admin - with stock info)
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get products error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate("reviews");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error("Get product error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update stock (Admin only)
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, action } = req.body; // action: 'add' or 'deduct'
    const normalizedQuantity = Number(quantity);

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number greater than zero",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (action === "add") {
      product.stockQuantity += normalizedQuantity;
    } else if (action === "deduct") {
      if (product.stockQuantity < normalizedQuantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }
      product.stockQuantity -= normalizedQuantity;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'add' or 'deduct'",
      });
    }

    await product.save();

    logger.info("Stock updated", { productId: id, action, quantity: normalizedQuantity });

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: product,
    });
  } catch (error) {
    logger.error("Update stock error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get low stock products (Admin)
export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;

    const products = await Product.find({
      stockQuantity: { $lt: Number(threshold) },
    }).select("name stockQuantity price");

    res.status(200).json({
      success: true,
      data: products,
      threshold: Number(threshold),
    });
  } catch (error) {
    logger.error("Get low stock products error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
