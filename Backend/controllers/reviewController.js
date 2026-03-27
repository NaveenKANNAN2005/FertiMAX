import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { logger } from "../utils/logger.js";

// Create review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, effectiveness, cropUsed } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = new Review({
      product: productId,
      user: req.user.id,
      rating,
      title,
      comment,
      effectiveness,
      cropUsed,
    });

    await review.save();
    await Review.recalculateProductMetrics(productId);
    await review.populate("product user");

    logger.info("Review created", { reviewId: review._id, productId });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    logger.error("Create review error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    logger.error("Get reviews error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    const allowedUpdates = {
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      effectiveness: req.body.effectiveness,
      cropUsed: req.body.cropUsed,
    };

    Object.entries(allowedUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        review[key] = value;
      }
    });

    await review.save();
    await Review.recalculateProductMetrics(review.product);
    await review.populate("product user");

    logger.info("Review updated", { reviewId: review._id });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    logger.error("Update review error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    const productId = review.product;
    await review.deleteOne();
    await Review.recalculateProductMetrics(productId);

    logger.info("Review deleted", { reviewId: req.params.id });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    logger.error("Delete review error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Review marked as helpful",
      data: review,
    });
  } catch (error) {
    logger.error("Mark helpful error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
