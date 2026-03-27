import express from "express";
import {
  analyzeDiseaseAndRecommend,
  analyzePlantImage,
  calculateDosage,
  getCropPlanRecommendation,
  getRecommendation,
  getUserRecommendations,
} from "../controllers/recommendationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Backward-compatible generic advisor endpoint
router.post("/", getRecommendation);

// Feature-specific advisor endpoints
router.post("/advisor", getCropPlanRecommendation);
router.post("/disease", analyzeDiseaseAndRecommend);
router.post("/image-diagnose", analyzePlantImage);
router.post("/dosage/calculate", calculateDosage);

// User recommendation history
router.get("/user", authenticate, getUserRecommendations);

export default router;
