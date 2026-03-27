// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  SEARCH_PRODUCTS: "/products/search",

  // Recommendations
  RECOMMENDATIONS: "/recommendations",
  USER_RECOMMENDATIONS: "/recommendations/user",
  CALCULATE_DOSAGE: "/recommendations/dosage/calculate",

  // Users
  REGISTER: "/users/register",
  USER_PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",

  // Orders
  ORDERS: "/orders",
  ORDER_DETAIL: (id) => `/orders/${id}`,
  CANCEL_ORDER: (id) => `/orders/${id}/cancel`,

  // Reviews
  REVIEWS: "/reviews",
  PRODUCT_REVIEWS: (productId) => `/reviews/product/${productId}`,
  UPDATE_REVIEW: (id) => `/reviews/${id}`,
  DELETE_REVIEW: (id) => `/reviews/${id}`,

  // Health
  HEALTH: "/health",
};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export default API_BASE_URL;
