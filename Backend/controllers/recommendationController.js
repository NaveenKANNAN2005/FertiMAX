import Recommendation from "../models/Recommendation.js";
import Product from "../models/Product.js";
import {
  generateAdvisorRecommendation,
  generateDiseaseRecommendation,
  generateDosagePlan,
  generateImageDiseaseDiagnosis,
} from "../services/aiAdvisorService.js";

const formatErrorResponse = (res, error) =>
  res.status(error.status || 500).json({
    success: false,
    message: error.message,
    code: error.code,
  });

const saveRecommendationIfAuthenticated = async (req, result) => {
  const recommendedProducts = result.recommendedProducts || [];

  if (!req.user?.id) {
    const populatedProducts = await Product.populate(recommendedProducts, {
      path: "product",
    });

    return {
      ...result,
      recommendedProducts: populatedProducts,
    };
  }

  const recommendation = new Recommendation({
    user: req.user.id,
    cropType: result.inputProfile.cropType || "General",
    soilType: result.inputProfile.soilType || "N/A",
    farmSize: Number(result.inputProfile.farmSize || 0),
    diseaseDetected: result.probableIssue || null,
    featureType: result.feature,
    summary: result.summary || "",
    aiProvider: result.engine?.provider || "rules-engine",
    aiModel: result.engine?.model || "fertimax-advisor-v2",
    providerStatus: result.engine?.providerStatus || "primary",
    recommendedProducts,
    aiConfidence: result.aiConfidence,
    status: "completed",
  });

  await recommendation.save();
  await recommendation.populate("recommendedProducts.product");

  return {
    ...result,
    _id: recommendation._id,
    createdAt: recommendation.createdAt,
    updatedAt: recommendation.updatedAt,
    recommendedProducts: recommendation.recommendedProducts,
  };
};

export const getCropPlanRecommendation = async (req, res) => {
  try {
    const { cropType, soilType, farmSize, cropStage, goal } = req.body;

    if (!cropType || !soilType || !farmSize || !cropStage || !goal) {
      return res.status(400).json({
        success: false,
        message: "Please provide cropType, soilType, farmSize, cropStage, and goal",
      });
    }

    const result = await generateAdvisorRecommendation(req.body);
    const payload = await saveRecommendationIfAuthenticated(req, result);

    return res.status(200).json({
      success: true,
      data: payload,
      message: "Advisor recommendation generated successfully",
    });
  } catch (error) {
    return formatErrorResponse(res, error);
  }
};

export const analyzeDiseaseAndRecommend = async (req, res) => {
  try {
    const { cropType, symptoms } = req.body;

    if (!cropType || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "Please provide cropType and symptoms",
      });
    }

    const result = await generateDiseaseRecommendation(req.body);
    const payload = await saveRecommendationIfAuthenticated(req, result);

    return res.status(200).json({
      success: true,
      data: payload,
      message: "Disease analysis generated successfully",
    });
  } catch (error) {
    return formatErrorResponse(res, error);
  }
};

export const getRecommendation = getCropPlanRecommendation;

export const analyzePlantImage = async (req, res) => {
  try {
    const { imageDataUrl, cropType } = req.body;

    if (!imageDataUrl || !cropType) {
      return res.status(400).json({
        success: false,
        message: "Please provide imageDataUrl and cropType",
      });
    }

    const result = await generateImageDiseaseDiagnosis(req.body);
    const payload = await saveRecommendationIfAuthenticated(req, result);

    return res.status(200).json({
      success: true,
      data: payload,
      message: "Plant image analyzed successfully",
    });
  } catch (error) {
    return formatErrorResponse(res, error);
  }
};

export const getUserRecommendations = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const recommendations = await Recommendation.find({ user: req.user.id })
      .populate("recommendedProducts.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    return formatErrorResponse(res, error);
  }
};

export const calculateDosage = async (req, res) => {
  try {
    const { productId, farmSize, cropType } = req.body;

    if (!productId || !farmSize || !cropType) {
      return res.status(400).json({
        success: false,
        message: "Please provide productId, farmSize, and cropType",
      });
    }

    const dosagePlan = await generateDosagePlan(req.body);

    if (!dosagePlan) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const payload = await saveRecommendationIfAuthenticated(req, dosagePlan);

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return formatErrorResponse(res, error);
  }
};
