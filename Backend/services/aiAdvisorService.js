import axios from "axios";
import Product from "../models/Product.js";
import {
  generateAdvisorRecommendation as generateFallbackAdvisorRecommendation,
  generateDiseaseRecommendation as generateFallbackDiseaseRecommendation,
  generateDosagePlan as generateFallbackDosagePlan,
} from "./cropAdvisorService.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const engineMetadata = (provider) => ({
  provider,
  model: provider === "gemini" ? GEMINI_MODEL : "fertimax-advisor-v2",
  aiReady: true,
  aiEnvVar: "GEMINI_API_KEY",
});

const createAppError = (message, status = 500, meta = {}) => {
  const error = new Error(message);
  error.status = status;
  Object.assign(error, meta);
  return error;
};

const allowedCategories = [
  "Organic",
  "NPK Blends",
  "Micronutrients",
  "Bio Stimulants",
  "Soil Conditioners",
  "Foliar Sprays",
];

const unique = (items) => [...new Set((items || []).filter(Boolean))];

const safeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getGeminiApiKey = () => process.env.GEMINI_API_KEY;
const hasGemini = () => Boolean(getGeminiApiKey());

const extractJsonText = (response) => {
  const parts = response.data?.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((part) => typeof part.text === "string");

  if (!textPart?.text) {
    throw new Error("AI response did not include text output");
  }

  return textPart.text.trim();
};

const parseJsonResponse = (response) => {
  const text = extractJsonText(response);
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const normalizedText =
    jsonStart >= 0 && jsonEnd >= jsonStart ? text.slice(jsonStart, jsonEnd + 1) : text;

  return JSON.parse(normalizedText);
};

const normalizeGeminiError = (error, featureLabel) => {
  const status = error.response?.status;
  const providerMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message;

  if (status === 429) {
    return createAppError(
      `${featureLabel} is temporarily busy because the Gemini quota has been reached. Please retry in a few minutes.`,
      429,
      { providerMessage, code: "GEMINI_QUOTA_EXCEEDED", shouldFallback: true }
    );
  }

  if (status === 401 || status === 403) {
    return createAppError(
      "Gemini API access is not authorized. Check the backend GEMINI_API_KEY and project access settings.",
      503,
      { providerMessage, code: "GEMINI_AUTH_ERROR", shouldFallback: true }
    );
  }

  if (status >= 500) {
    return createAppError(
      `${featureLabel} is temporarily unavailable from the Gemini provider. Please try again shortly.`,
      503,
      { providerMessage, code: "GEMINI_PROVIDER_ERROR", shouldFallback: true }
    );
  }

  if (error.code === "ECONNABORTED") {
    return createAppError(
      `${featureLabel} took too long to respond. Please retry with a slightly shorter request.`,
      504,
      { providerMessage, code: "GEMINI_TIMEOUT", shouldFallback: true }
    );
  }

  if (error.code === "ENOTFOUND" || error.code === "ECONNRESET") {
    return createAppError(
      `${featureLabel} is temporarily unavailable because the AI service could not be reached.`,
      503,
      { providerMessage, code: "GEMINI_NETWORK_ERROR", shouldFallback: true }
    );
  }

  return createAppError(
    `${featureLabel} could not be completed right now.`,
    500,
    { providerMessage, code: "GEMINI_UNKNOWN_ERROR", shouldFallback: true }
  );
};

const parseImageDataUrl = (imageDataUrl) => {
  const match = String(imageDataUrl || "").match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image payload. Expected a base64 data URL.");
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
};

const buildJsonPrompt = ({ schemaName, instructions, exampleShape, payload }) => [
  `Return only a valid JSON object for schema "${schemaName}".`,
  "Do not wrap the response in markdown.",
  "Keep the output concise, agronomically practical, and conservative.",
  instructions,
  `Expected JSON shape: ${JSON.stringify(exampleShape)}`,
  `Input payload: ${JSON.stringify(payload)}`,
].join("\n\n");

const createStructuredResponse = async ({
  schemaName,
  instructions,
  exampleShape,
  payload,
  imageDataUrl,
}) => {
  const parts = [{ text: buildJsonPrompt({ schemaName, instructions, exampleShape, payload }) }];

  if (imageDataUrl) {
    const { mimeType, data } = parseImageDataUrl(imageDataUrl);
    parts.push({
      inlineData: {
        mimeType,
        data,
      },
    });
  }

  try {
    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${encodeURIComponent(getGeminiApiKey())}`,
      {
        systemInstruction: {
          parts: [
            {
              text: "You are a practical agricultural advisor for a fertilizer reservation platform. Analyze farm context carefully. Never invent shop products. Return only the requested JSON.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: 0.15,
          topP: 0.85,
          responseMimeType: "application/json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 45000,
      }
    );

    return parseJsonResponse(response);
  } catch (error) {
    throw normalizeGeminiError(error, schemaName);
  }
};

const scoreProduct = (product, { categories, keywords, preferLowerPrice }) => {
  let score = Number(product.rating || 0) * 20;

  if (categories.includes(product.category)) {
    score += 30;
  }

  const haystack = [
    product.name,
    product.description,
    product.instructions,
    ...(product.bestFor || []),
    product.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  keywords.forEach((keyword) => {
    if (haystack.includes(keyword)) {
      score += 10;
    }
  });

  score += Math.min(Number(product.stockQuantity || 0), 200) * 0.05;
  score -= Number(product.price || 0) * (preferLowerPrice ? 0.15 : 0.04);

  return score;
};

const buildDosageText = ({ farmSize, unit, basePerAcre }) =>
  `${Number((farmSize * basePerAcre).toFixed(1))}${unit} total for ${farmSize} acres`;

const selectCatalogProducts = async ({
  categories,
  keywords,
  farmSize,
  limit = 4,
  preferLowerPrice = false,
  basePerAcre = 30,
  reasonPrefix = "",
}) => {
  const query = {
    isActive: true,
    stockQuantity: { $gt: 0 },
  };

  if (categories?.length) {
    query.category = { $in: categories };
  }

  const products = await Product.find(query).limit(24);
  const ranked = products
    .sort(
      (a, b) =>
        scoreProduct(b, { categories, keywords, preferLowerPrice }) -
        scoreProduct(a, { categories, keywords, preferLowerPrice })
    )
    .slice(0, limit);

  return ranked.map((product, index) => ({
    product: product._id,
    dosage: buildDosageText({
      farmSize,
      unit: product.unit,
      basePerAcre: Number((basePerAcre + index * 4).toFixed(1)),
    }),
    reason: `${reasonPrefix}${reasonPrefix ? ". " : ""}Available in shop with ${product.stockQuantity} ${product.unit} in stock`,
    priority: index === 0 ? "High" : index === 1 ? "Medium" : "Low",
    availability: {
      inStock: product.stockQuantity > 0,
      stockQuantity: product.stockQuantity,
      unit: product.unit,
      price: product.price,
    },
  }));
};

const advisorExampleShape = {
  summary: "Balanced crop plan summary",
  confidence: 86,
  categoryHints: ["NPK Blends", "Organic"],
  keywordHints: ["balanced nutrition", "wheat", "vegetative"],
  operationalNotes: ["Apply in split schedule", "Monitor field response"],
  warnings: ["Avoid over-application on stressed fields"],
  recommendedBasePerAcre: 40,
};

const diseaseExampleShape = {
  summary: "Disease triage summary",
  probableIssue: "Possible fungal leaf spot",
  confidence: 84,
  categoryHints: ["Foliar Sprays", "Micronutrients"],
  keywordHints: ["fungal", "leaf spot", "yellowing"],
  triage: ["Remove heavily affected leaves", "Improve airflow"],
  warnings: ["Escalate severe spread to field expert"],
  recommendedBasePerAcre: 28,
};

const dosageExampleShape = {
  summary: "Conservative dosage plan summary",
  confidence: 85,
  baseDosagePerAcre: 24,
  frequency: "Every 10 to 14 days",
  duration: "2 to 3 scheduled cycles",
  applications: 2,
  assumptions: ["Based on standard field conditions", "Soil application assumed"],
};

const withFallbackMessage = (result, message) => ({
  ...result,
  warnings: unique([...(result.warnings || []), message]),
  engine: {
    ...result.engine,
    aiReady: true,
    providerStatus: "fallback",
  },
});

const normalizeAdvisorAnalysis = (analysis) => ({
  summary: String(analysis?.summary || "Prepared a crop plan using the supplied field context."),
  confidence: Math.max(0, Math.min(100, safeNumber(analysis?.confidence, 86))),
  categoryHints: unique(analysis?.categoryHints).filter((item) => allowedCategories.includes(item)),
  keywordHints: unique(analysis?.keywordHints).map((item) => String(item).toLowerCase()),
  operationalNotes: unique(analysis?.operationalNotes).map(String),
  warnings: unique(analysis?.warnings).map(String),
  recommendedBasePerAcre: safeNumber(analysis?.recommendedBasePerAcre, 40),
});

const normalizeDiseaseAnalysis = (analysis) => ({
  summary: String(analysis?.summary || "Analyzed crop symptoms and prepared a triage response."),
  probableIssue: String(analysis?.probableIssue || "Possible crop stress"),
  confidence: Math.max(0, Math.min(100, safeNumber(analysis?.confidence, 84))),
  categoryHints: unique(analysis?.categoryHints).filter((item) => allowedCategories.includes(item)),
  keywordHints: unique(analysis?.keywordHints).map((item) => String(item).toLowerCase()),
  triage: unique(analysis?.triage).map(String),
  warnings: unique(analysis?.warnings).map(String),
  recommendedBasePerAcre: safeNumber(analysis?.recommendedBasePerAcre, 28),
});

const normalizeDosageAnalysis = (analysis) => ({
  summary: String(analysis?.summary || "Prepared a dosage plan for the selected product."),
  confidence: Math.max(0, Math.min(100, safeNumber(analysis?.confidence, 85))),
  baseDosagePerAcre: safeNumber(analysis?.baseDosagePerAcre, 25),
  frequency: String(analysis?.frequency || "Every 15 to 20 days"),
  duration: String(analysis?.duration || "2 scheduled cycles"),
  applications: Math.max(1, Math.round(safeNumber(analysis?.applications, 2))),
  assumptions: unique(analysis?.assumptions).map(String),
});

export const generateAdvisorRecommendation = async (input) => {
  if (!hasGemini()) {
    const fallback = await generateFallbackAdvisorRecommendation(input);
    return withFallbackMessage(
      { ...fallback, engine: { ...engineMetadata("rules-engine"), providerStatus: "fallback" } },
      "Gemini is not configured on the backend, so the advisor used the built-in fallback logic."
    );
  }

  let rawAnalysis;
  try {
    rawAnalysis = await createStructuredResponse({
      schemaName: "advisor_plan",
      instructions:
        "Analyze the farm context and provide planning logic, category hints, keyword hints, operational notes, warnings, and a conservative base-per-acre recommendation. Prefer agronomic reasoning tied to crop stage, soil behavior, growth goal, field notes, and budget tradeoffs. Do not invent products.",
      exampleShape: advisorExampleShape,
      payload: input,
    });
  } catch (error) {
    if (error.shouldFallback) {
      const fallback = await generateFallbackAdvisorRecommendation(input);
      return withFallbackMessage(
        { ...fallback, engine: { ...engineMetadata("rules-engine"), providerStatus: "fallback" } },
        error.message
      );
    }
    throw error;
  }

  const analysis = normalizeAdvisorAnalysis(rawAnalysis);
  const categories = analysis.categoryHints;
  const keywords = unique([
    ...(analysis.keywordHints || []),
    String(input.cropType || "").toLowerCase(),
    String(input.soilType || "").toLowerCase(),
    String(input.goal || "").toLowerCase(),
  ]);

  const recommendedProducts = await selectCatalogProducts({
    categories,
    keywords,
    farmSize: Number(input.farmSize),
    preferLowerPrice: input.budget === "economical",
    basePerAcre: analysis.recommendedBasePerAcre,
    reasonPrefix: analysis.summary,
  });

  return {
    feature: "advisor",
    summary: analysis.summary,
    aiConfidence: analysis.confidence,
    engine: { ...engineMetadata("gemini"), providerStatus: "primary" },
    inputProfile: input,
    operationalNotes: analysis.operationalNotes,
    warnings: analysis.warnings,
    recommendedProducts,
  };
};

export const generateDiseaseRecommendation = async (input) => {
  const normalizedInput = {
    soilType: input.soilType || "Loam",
    farmSize: safeNumber(input.farmSize, 1),
    cropStage: input.cropStage || "vegetative",
    severity: input.severity || "moderate",
    affectedArea: input.affectedArea || "localized",
    ...input,
  };

  if (!hasGemini()) {
    const fallback = await generateFallbackDiseaseRecommendation(normalizedInput);
    return withFallbackMessage(
      { ...fallback, engine: { ...engineMetadata("rules-engine"), providerStatus: "fallback" } },
      "Gemini is not configured on the backend, so crop triage used the built-in fallback logic."
    );
  }

  let rawAnalysis;
  try {
    rawAnalysis = await createStructuredResponse({
      schemaName: "disease_triage",
      instructions:
        "Infer the most likely crop issue from symptoms and context. Prioritize disease patterns, nutrient deficiency signals, and pest stress clues separately. Use severity, crop stage, and spread pattern to refine the diagnosis. Return a concise probable issue, summary, category hints, keyword hints, triage steps, warnings, and a conservative treatment baseline. Do not invent products.",
      exampleShape: diseaseExampleShape,
      payload: normalizedInput,
    });
  } catch (error) {
    if (error.shouldFallback) {
      const fallback = await generateFallbackDiseaseRecommendation(normalizedInput);
      return withFallbackMessage(
        { ...fallback, engine: { ...engineMetadata("rules-engine"), providerStatus: "fallback" } },
        error.message
      );
    }
    throw error;
  }

  const analysis = normalizeDiseaseAnalysis(rawAnalysis);
  const categories = analysis.categoryHints;
  const keywords = unique([
    ...(analysis.keywordHints || []),
    analysis.probableIssue.toLowerCase(),
    String(normalizedInput.symptoms || "").toLowerCase(),
  ]);

  const recommendedProducts = await selectCatalogProducts({
    categories,
    keywords,
    farmSize: Number(normalizedInput.farmSize),
    basePerAcre: analysis.recommendedBasePerAcre,
    reasonPrefix: analysis.probableIssue,
  });

  return {
    feature: "disease",
    summary: analysis.summary,
    probableIssue: analysis.probableIssue,
    aiConfidence: analysis.confidence,
    engine: { ...engineMetadata("gemini"), providerStatus: "primary" },
    inputProfile: normalizedInput,
    triage: analysis.triage,
    warnings: analysis.warnings,
    recommendedProducts,
  };
};

export const generateImageDiseaseDiagnosis = async (input) => {
  if (!hasGemini()) {
    throw createAppError(
      "Plant scan requires a working Gemini configuration on the backend before image diagnosis can run.",
      503,
      { code: "GEMINI_IMAGE_NOT_CONFIGURED" }
    );
  }

  const normalizedInput = {
    cropStage: input.cropStage || "vegetative",
    notes: input.notes || "",
    ...input,
  };

  const { imageDataUrl, cropType, cropStage, notes } = normalizedInput;

  let rawAnalysis;
  try {
    rawAnalysis = await createStructuredResponse({
      schemaName: "image_disease_triage",
      instructions:
        "Analyze the plant image and supporting context. Focus on visible lesion shape, discoloration pattern, leaf curling, edge burn, wilting, pest damage, fungal spotting, and deficiency-like chlorosis. Distinguish probable disease from nutrient stress when the evidence is mixed. If image certainty is limited, say so through lower confidence and cautious warnings. Return a concise probable issue, summary, category hints, keyword hints, triage steps, warnings, and a conservative treatment baseline. Do not invent products.",
      exampleShape: diseaseExampleShape,
      payload: {
        cropType,
        cropStage,
        notes,
      },
      imageDataUrl,
    });
  } catch (error) {
    throw error.shouldFallback
      ? createAppError(
          `${error.message} Plant image diagnosis needs the Gemini vision service, so there is no local fallback for this feature.`,
          error.status || 503,
          { code: error.code || "GEMINI_IMAGE_UNAVAILABLE" }
        )
      : error;
  }

  const analysis = normalizeDiseaseAnalysis(rawAnalysis);
  const categories = analysis.categoryHints;
  const keywords = unique([
    ...(analysis.keywordHints || []),
    analysis.probableIssue.toLowerCase(),
    String(notes || "").toLowerCase(),
    String(cropType || "").toLowerCase(),
  ]);

  const recommendedProducts = await selectCatalogProducts({
    categories,
    keywords,
    farmSize: 1,
    basePerAcre: analysis.recommendedBasePerAcre,
    reasonPrefix: `Image analysis suggests ${analysis.probableIssue}`,
  });

  return {
    feature: "image_diagnosis",
    summary: analysis.summary,
    probableIssue: analysis.probableIssue,
    aiConfidence: analysis.confidence,
    engine: { ...engineMetadata("gemini"), providerStatus: "primary" },
    inputProfile: normalizedInput,
    triage: analysis.triage,
    warnings: analysis.warnings,
    recommendedProducts,
  };
};

export const generateDosagePlan = async (input) => {
  const normalizedInput = {
    cropStage: input.cropStage || "vegetative",
    soilType: input.soilType || "Loam",
    applicationMode: input.applicationMode || "soil",
    ...input,
  };

  const product = await Product.findById(normalizedInput.productId);
  if (!product) {
    return null;
  }

  if (!hasGemini()) {
    const fallback = await generateFallbackDosagePlan(normalizedInput);
    return withFallbackMessage(
      { ...fallback, engine: { ...engineMetadata("rules-engine"), providerStatus: "fallback" } },
      "Gemini is not configured on the backend, so the dosage planner used the built-in fallback logic."
    );
  }

  let rawAnalysis;
  try {
    rawAnalysis = await createStructuredResponse({
      schemaName: "dosage_plan",
      instructions:
        "Given the product profile and farm context, produce a structured, conservative dosage plan. Use the product category, crop stage, application mode, and basic agronomic caution. Keep the advice practical and avoid aggressive dosage values.",
      exampleShape: dosageExampleShape,
      payload: {
        ...normalizedInput,
        product: {
          name: product.name,
          category: product.category,
          unit: product.unit,
          description: product.description,
          instructions: product.instructions,
          price: product.price,
        },
      },
    });
  } catch (error) {
    if (error.shouldFallback) {
      const fallback = await generateFallbackDosagePlan(normalizedInput);
      return withFallbackMessage(
        { ...fallback, engine: { ...engineMetadata("rules-engine"), providerStatus: "fallback" } },
        error.message
      );
    }
    throw error;
  }

  const analysis = normalizeDosageAnalysis(rawAnalysis);
  const basePerAcre = analysis.baseDosagePerAcre;
  const farmSize = Number(normalizedInput.farmSize);
  const totalDosage = Number((basePerAcre * farmSize).toFixed(1));

  return {
    feature: "dosage",
    summary: analysis.summary,
    aiConfidence: analysis.confidence,
    engine: { ...engineMetadata("gemini"), providerStatus: "primary" },
    product: product.name,
    farmSize,
    cropType: normalizedInput.cropType,
    soilType: normalizedInput.soilType,
    cropStage: normalizedInput.cropStage,
    applicationMode: normalizedInput.applicationMode,
    category: product.category,
    perApplication: `${basePerAcre}${product.unit} per acre`,
    totalDosage: `${totalDosage}${product.unit}`,
    frequency: analysis.frequency,
    duration: analysis.duration,
    applications: analysis.applications,
    cost: Number((totalDosage * Number(product.price || 0)).toFixed(2)),
    assumptions: analysis.assumptions,
  };
};
