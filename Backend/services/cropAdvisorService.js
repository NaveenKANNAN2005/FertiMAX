import Product from "../models/Product.js";

const cropCategoryMap = {
  Rice: ["NPK Blends", "Micronutrients", "Soil Conditioners"],
  Wheat: ["NPK Blends", "Soil Conditioners", "Organic"],
  Corn: ["NPK Blends", "Bio Stimulants", "Micronutrients"],
  Vegetables: ["Organic", "Micronutrients", "Foliar Sprays"],
  Fruits: ["Organic", "Bio Stimulants", "Foliar Sprays"],
};

const soilCategoryMap = {
  Clay: ["Soil Conditioners", "Organic"],
  Sand: ["Soil Conditioners", "Organic", "Bio Stimulants"],
  Loam: ["NPK Blends", "Micronutrients"],
  Silt: ["Foliar Sprays", "Micronutrients", "NPK Blends"],
};

const goalCategoryMap = {
  yield: ["NPK Blends", "Micronutrients"],
  recovery: ["Bio Stimulants", "Organic"],
  root_strength: ["Soil Conditioners", "Organic"],
  balanced_nutrition: ["NPK Blends", "Micronutrients", "Organic"],
  flowering: ["Foliar Sprays", "Micronutrients"],
};

const stageDosageMultipliers = {
  pre_sowing: 0.85,
  vegetative: 1,
  flowering: 0.9,
  fruiting: 0.95,
  recovery: 0.75,
};

const urgencyMultipliers = {
  low: 0.95,
  medium: 1,
  high: 1.05,
};

const budgetWeights = {
  economical: { maxProducts: 3, preferLowerPrice: true },
  standard: { maxProducts: 4, preferLowerPrice: false },
  premium: { maxProducts: 4, preferLowerPrice: false },
};

const diseaseProfiles = [
  {
    key: "fungal_leaf_spot",
    label: "Possible fungal leaf spot",
    symptoms: ["spots", "yellow spots", "brown spots", "leaf spot", "blotch"],
    categories: ["Foliar Sprays", "Micronutrients", "Organic"],
    bestForTerms: ["fungal", "leaf", "spot"],
    triage: [
      "Remove badly infected leaves where possible.",
      "Avoid overwatering and improve airflow around the crop.",
      "Use foliar support products in early morning or late evening.",
    ],
  },
  {
    key: "nutrient_deficiency",
    label: "Likely nutrient deficiency",
    symptoms: ["yellowing", "chlorosis", "stunted", "pale", "weak growth"],
    categories: ["Micronutrients", "NPK Blends", "Bio Stimulants"],
    bestForTerms: ["deficiency", "nutrition", "growth"],
    triage: [
      "Check irrigation consistency before applying corrective dosage.",
      "Prioritize balanced nutrition and micronutrient support.",
      "Monitor new leaf growth over the next 7 to 10 days.",
    ],
  },
  {
    key: "pest_pressure",
    label: "Likely pest-related crop stress",
    symptoms: ["holes", "curling", "chewed", "insects", "pests", "bite marks"],
    categories: ["Organic", "Foliar Sprays", "Bio Stimulants"],
    bestForTerms: ["pest", "stress", "recovery"],
    triage: [
      "Inspect the underside of leaves and surrounding soil for pest presence.",
      "Isolate affected plants or areas when practical.",
      "Combine recovery nutrition with pest management outside this product set.",
    ],
  },
];

const engineMetadata = {
  provider: "rules-engine",
  model: "fertimax-advisor-v2",
  aiReady: true,
  aiEnvVar: "GEMINI_API_KEY",
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const toHeadline = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const scoreProduct = (product, matcher) => {
  let score = Number(product.rating || 0) * 20;

  if (matcher.categories.includes(product.category)) {
    score += 30;
  }

  const bestFor = (product.bestFor || []).join(" ").toLowerCase();
  const description = `${product.name} ${product.description || ""} ${product.instructions || ""}`.toLowerCase();

  matcher.keywords.forEach((keyword) => {
    if (bestFor.includes(keyword)) {
      score += 14;
    } else if (description.includes(keyword)) {
      score += 8;
    }
  });

  if (matcher.preferLowerPrice) {
    score -= Number(product.price || 0) * 0.15;
  } else {
    score -= Number(product.price || 0) * 0.03;
  }

  if (product.stockQuantity > 0 && product.stockQuantity < 15) {
    score -= 4;
  }

  return score;
};

const queryProducts = async ({ categories, keywords, limit = 10 }) => {
  const query = {
    isActive: true,
    stockQuantity: { $gt: 0 },
  };

  if (categories.length > 0) {
    query.category = { $in: categories };
  }

  const products = await Product.find(query).limit(limit * 3);

  return products
    .sort(
      (a, b) =>
        scoreProduct(b, { categories, keywords, preferLowerPrice: false }) -
        scoreProduct(a, { categories, keywords, preferLowerPrice: false })
    )
    .slice(0, limit);
};

const buildDosageText = ({ farmSize, unit, basePerAcre }) =>
  `${Number((farmSize * basePerAcre).toFixed(1))}${unit} total for ${farmSize} acres`;

export const generateAdvisorRecommendation = async (input) => {
  const cropType = input.cropType;
  const soilType = input.soilType;
  const farmSize = Number(input.farmSize);
  const cropStage = input.cropStage || "vegetative";
  const goal = input.goal || "balanced_nutrition";
  const budget = input.budget || "standard";
  const urgency = input.urgency || "medium";
  const notes = String(input.notes || "").trim();

  const categories = unique([
    ...(cropCategoryMap[cropType] || []),
    ...(soilCategoryMap[soilType] || []),
    ...(goalCategoryMap[goal] || []),
  ]);

  const keywords = unique([
    normalizeText(cropType),
    normalizeText(soilType),
    normalizeText(goal),
    normalizeText(cropStage),
    ...notes
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter((token) => token.length > 3)
      .slice(0, 6),
  ]);

  const productPool = await Product.find({
    category: { $in: categories },
    isActive: true,
    stockQuantity: { $gt: 0 },
  }).limit(18);

  const budgetConfig = budgetWeights[budget] || budgetWeights.standard;

  const rankedProducts = productPool
    .sort(
      (a, b) =>
        scoreProduct(b, {
          categories,
          keywords,
          preferLowerPrice: budgetConfig.preferLowerPrice,
        }) -
        scoreProduct(a, {
          categories,
          keywords,
          preferLowerPrice: budgetConfig.preferLowerPrice,
        })
    )
    .slice(0, budgetConfig.maxProducts);

  const stageFactor = stageDosageMultipliers[cropStage] || 1;
  const urgencyFactor = urgencyMultipliers[urgency] || 1;
  const basePerAcre = Number((45 * stageFactor * urgencyFactor).toFixed(1));

  const recommendedProducts = rankedProducts.map((product, index) => ({
    product: product._id,
    dosage: buildDosageText({
      farmSize,
      unit: product.unit,
      basePerAcre: basePerAcre + index * 4,
    }),
    reason: `Matched for ${cropType} on ${soilType} soil during ${toHeadline(cropStage)} with a ${toHeadline(goal)} objective`,
    priority: index === 0 ? "High" : index === 1 ? "Medium" : "Low",
  }));

  const summary =
    recommendedProducts.length > 0
      ? `Built a ${toHeadline(goal)} plan for ${cropType} on ${soilType} soil, prioritizing ${rankedProducts[0]?.name || "available products"} for the ${toHeadline(cropStage)} stage.`
      : `No active products matched the current ${cropType}, ${soilType}, and ${toHeadline(goal)} profile.`;

  return {
    feature: "advisor",
    summary,
    aiConfidence: recommendedProducts.length > 0 ? 88 : 42,
    engine: engineMetadata,
    inputProfile: {
      cropType,
      soilType,
      farmSize,
      cropStage,
      goal,
      budget,
      urgency,
      notes,
    },
    operationalNotes: [
      `Target ${toHeadline(goal)} with applications calibrated for the ${toHeadline(cropStage)} stage.`,
      urgency === "high"
        ? "Prioritize products with faster visible response and available stock."
        : "Prefer steady application and monitor crop response before increasing dosage.",
      budget === "economical"
        ? "Selections were biased toward lower cost products."
        : "Selections balance field fit, quality, and stock availability.",
    ],
    recommendedProducts,
  };
};

export const generateDiseaseRecommendation = async (input) => {
  const cropType = input.cropType;
  const soilType = input.soilType;
  const farmSize = Number(input.farmSize);
  const cropStage = input.cropStage || "vegetative";
  const severity = input.severity || "moderate";
  const affectedArea = input.affectedArea || "localized";
  const symptoms = String(input.symptoms || "").trim();
  const symptomText = symptoms.toLowerCase();

  const matchedProfile =
    diseaseProfiles.find((profile) =>
      profile.symptoms.some((term) => symptomText.includes(term))
    ) || diseaseProfiles[1];

  const categories = unique([
    ...matchedProfile.categories,
    ...(cropCategoryMap[cropType] || []),
    ...(soilCategoryMap[soilType] || []),
  ]);

  const keywords = unique([
    normalizeText(cropType),
    normalizeText(soilType),
    ...matchedProfile.bestForTerms,
    ...symptomText.split(/[^a-z0-9]+/i).filter((token) => token.length > 3).slice(0, 8),
  ]);

  const products = await queryProducts({ categories, keywords, limit: 4 });

  const severityFactor = severity === "severe" ? 1.1 : severity === "mild" ? 0.85 : 1;
  const stageFactor = stageDosageMultipliers[cropStage] || 1;

  const recommendedProducts = products.map((product, index) => ({
    product: product._id,
    dosage: buildDosageText({
      farmSize,
      unit: product.unit,
      basePerAcre: Number((28 * severityFactor * stageFactor + index * 3).toFixed(1)),
    }),
    reason: `${matchedProfile.label} support for ${cropType} with ${affectedArea} impact at ${toHeadline(severity)} severity`,
    priority: index === 0 ? "High" : "Medium",
  }));

  return {
    feature: "disease",
    summary: `Symptoms most closely match ${matchedProfile.label.toLowerCase()} for ${cropType}. Recommendations favor recovery support and field-manageable products.`,
    probableIssue: matchedProfile.label,
    aiConfidence: matchedProfile === diseaseProfiles[1] ? 74 : 90,
    engine: engineMetadata,
    inputProfile: {
      cropType,
      soilType,
      farmSize,
      cropStage,
      severity,
      affectedArea,
      symptoms,
    },
    triage: matchedProfile.triage,
    warnings: [
      severity === "severe"
        ? "Severe symptoms should be validated with an agronomist or local extension expert."
        : "Monitor the crop for progression after the first treatment cycle.",
      affectedArea === "widespread"
        ? "Widespread symptoms suggest checking irrigation, drainage, and cross-field spread risk."
        : "Localized symptoms can often be contained with early intervention.",
    ],
    recommendedProducts,
  };
};

export const generateDosagePlan = async (input) => {
  const productId = input.productId;
  const farmSize = Number(input.farmSize);
  const cropType = input.cropType;
  const soilType = input.soilType || "Loam";
  const cropStage = input.cropStage || "vegetative";
  const applicationMode = input.applicationMode || "soil";

  const product = await Product.findById(productId);

  if (!product) {
    return null;
  }

  const stageFactor = stageDosageMultipliers[cropStage] || 1;
  const applicationFactor = applicationMode === "foliar" ? 0.65 : 1;
  const categoryBaseMap = {
    Organic: 55,
    "NPK Blends": 45,
    Micronutrients: 18,
    "Bio Stimulants": 22,
    "Soil Conditioners": 40,
    "Foliar Sprays": 14,
  };

  const basePerAcre = Number(
    ((categoryBaseMap[product.category] || 35) * stageFactor * applicationFactor).toFixed(1)
  );
  const totalDosage = Number((basePerAcre * farmSize).toFixed(1));
  const applicationCount = applicationMode === "foliar" ? 3 : 2;
  const cost = Number((totalDosage * Number(product.price || 0)).toFixed(2));

  return {
    feature: "dosage",
    engine: engineMetadata,
    product: product.name,
    farmSize,
    cropType,
    soilType,
    cropStage,
    applicationMode,
    category: product.category,
    perApplication: `${basePerAcre}${product.unit} per acre`,
    totalDosage: `${totalDosage}${product.unit}`,
    frequency:
      applicationMode === "foliar"
        ? "Every 10 to 14 days"
        : "Every 20 to 30 days",
    duration:
      cropStage === "pre_sowing" ? "1 to 2 pre-plant cycles" : "2 to 3 scheduled cycles",
    applications: applicationCount,
    cost,
    assumptions: [
      `Dosage uses ${product.category} category defaults rather than lab-specific nutrient analysis.`,
      `The ${toHeadline(cropStage)} stage multiplier was applied for ${cropType}.`,
      `${toHeadline(applicationMode)} application was assumed for ${soilType} soil conditions.`,
    ],
  };
};
