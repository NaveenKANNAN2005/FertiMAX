import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateStock,
  getLowStockProducts,
} from "../controllers/adminProductController.js";

const router = express.Router();

// All routes protected - require authentication and admin role
router.use(authenticate, authorize);

// Create new product
router.post("/products", createProduct);

// Get all products with pagination and filtering
router.get("/products", getAllProducts);

// Get low stock products
router.get("/products/low-stock", getLowStockProducts);

// Get single product
router.get("/products/:id", getProductById);

// Update product details
router.put("/products/:id", updateProduct);

// Update product stock
router.patch("/products/:id/stock", updateStock);

// Delete product
router.delete("/products/:id", deleteProduct);

export default router;
