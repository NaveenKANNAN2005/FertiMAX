import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/productController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", authenticate, authorize, createProduct);
router.put("/:id", authenticate, authorize, updateProduct);
router.delete("/:id", authenticate, authorize, deleteProduct);

export default router;
