import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from "../controllers/reviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateReviewCreate } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes
router.post("/", authenticate, validateReviewCreate, createReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);
router.post("/:id/helpful", markReviewHelpful);

export default router;
