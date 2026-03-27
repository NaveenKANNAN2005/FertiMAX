// Application Constants
export const CROP_TYPES = [
  "Rice",
  "Wheat",
  "Corn",
  "Vegetables",
  "Fruits",
  "Other",
];

export const SOIL_TYPES = ["Clay", "Sand", "Loam", "Silt", "Other"];

export const PRODUCT_CATEGORIES = [
  "Organic",
  "NPK Blends",
  "Micronutrients",
  "Bio Stimulants",
  "Soil Conditioners",
  "Foliar Sprays",
];

export const DISEASES = [
  "Leaf Blight",
  "Root Rot",
  "Powdery Mildew",
  "Leaf Spot",
  "Stem Rust",
  "Fusarium",
  "Other",
];

export const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export const RATING_OPTIONS = [
  { value: 5, label: "⭐⭐⭐⭐⭐ (5.0)" },
  { value: 4, label: "⭐⭐⭐⭐ (4.0+)" },
  { value: 3, label: "⭐⭐⭐ (3.0+)" },
  { value: 2, label: "⭐⭐ (2.0+)" },
  { value: 1, label: "⭐ (1.0+)" },
];

export const ITEMS_PER_PAGE = 12;
export const DEFAULT_PAGE = 1;
