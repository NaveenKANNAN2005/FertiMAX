import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      trim: true,
    },
    effectiveness: {
      type: String,
      enum: ["very_effective", "effective", "moderate", "not_effective"],
    },
    cropUsed: String,
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.recalculateProductMetrics = async function (productId) {
  const Product = mongoose.model("Product");
  const reviews = await this.find({ product: productId }).select("_id rating");
  const reviewIds = reviews.map((review) => review._id);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    reviews: reviewIds,
  });
};

export default mongoose.model("Review", reviewSchema);
