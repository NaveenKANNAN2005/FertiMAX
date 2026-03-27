import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cropType: {
      type: String,
      required: true,
      trim: true,
    },
    soilType: {
      type: String,
      default: "N/A",
      trim: true,
    },
    farmSize: {
      type: Number,
      default: 0,
    },
    diseaseDetected: {
      type: String,
      default: null,
    },
    featureType: {
      type: String,
      enum: ["advisor", "disease", "image_diagnosis", "dosage"],
      required: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    aiProvider: {
      type: String,
      default: "rules-engine",
      trim: true,
    },
    aiModel: {
      type: String,
      default: "fertimax-advisor-v2",
      trim: true,
    },
    recommendedProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        dosage: String,
        reason: String,
        priority: {
          type: String,
          enum: ["High", "Medium", "Low"],
        },
      },
    ],
    aiConfidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "applied"],
      default: "pending",
    },
    providerStatus: {
      type: String,
      enum: ["primary", "fallback"],
      default: "primary",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Recommendation", recommendationSchema);
