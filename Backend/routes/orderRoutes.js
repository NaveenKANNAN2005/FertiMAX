import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
} from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Order Routes - Protected
router.post("/", authenticate, createOrder);
router.get("/my-orders", authenticate, getUserOrders);
router.get("/:id", authenticate, getOrderById);
router.patch("/:id/cancel", authenticate, cancelOrder);

// Admin Order Routes - Protected by admin role
router.get("/admin/all-orders", authenticate, authorize, getAllOrders);
router.get("/admin/stats", authenticate, authorize, getOrderStats);
router.patch("/admin/:id/status", authenticate, authorize, updateOrderStatus);

export default router;
