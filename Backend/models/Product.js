import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Organic",
        "NPK Blends",
        "Micronutrients",
        "Bio Stimulants",
        "Soil Conditioners",
        "Foliar Sprays",
      ],
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["kg", "liter", "gram", "ml"],
      default: "kg",
    },
    composition: {
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      micronutrients: [String],
    },
    bestFor: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    manufacturer: String,
    instructions: String,
    image: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
