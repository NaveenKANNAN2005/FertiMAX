// Constants for application
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

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
  NET_BANKING: "net_banking",
  UPI: "upi",
  COD: "cash_on_delivery",
};

export const RECOMMENDATION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  APPLIED: "applied",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
