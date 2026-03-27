import apiClient from "../lib/apiClient.js";
import { API_ENDPOINTS } from "../config/api.js";

// Product API calls
export const productAPI = {
  getAll: (params) =>
    apiClient.get(API_ENDPOINTS.PRODUCTS, { params }),
  getById: (id) =>
    apiClient.get(API_ENDPOINTS.PRODUCT_DETAIL(id)),
  search: (query) =>
    apiClient.get(API_ENDPOINTS.SEARCH_PRODUCTS, { params: { q: query } }),
};

// Recommendation API calls
export const recommendationAPI = {
  getRecommendation: (data) =>
    apiClient.post(API_ENDPOINTS.RECOMMENDATIONS, data),
  getUserRecommendations: () =>
    apiClient.get(API_ENDPOINTS.USER_RECOMMENDATIONS),
  calculateDosage: (data) =>
    apiClient.post(API_ENDPOINTS.CALCULATE_DOSAGE, data),
};

// User API calls
export const userAPI = {
  register: (data) =>
    apiClient.post(API_ENDPOINTS.REGISTER, data),
  getProfile: () =>
    apiClient.get(API_ENDPOINTS.USER_PROFILE),
  updateProfile: (data) =>
    apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, data),
};

// Order API calls
export const orderAPI = {
  create: (data) =>
    apiClient.post(API_ENDPOINTS.ORDERS, data),
  getAll: () =>
    apiClient.get(API_ENDPOINTS.ORDERS),
  getById: (id) =>
    apiClient.get(API_ENDPOINTS.ORDER_DETAIL(id)),
  cancel: (id) =>
    apiClient.put(API_ENDPOINTS.CANCEL_ORDER(id)),
};

// Review API calls
export const reviewAPI = {
  create: (data) =>
    apiClient.post(API_ENDPOINTS.REVIEWS, data),
  getProductReviews: (productId) =>
    apiClient.get(API_ENDPOINTS.PRODUCT_REVIEWS(productId)),
  update: (id, data) =>
    apiClient.put(API_ENDPOINTS.UPDATE_REVIEW(id), data),
  delete: (id) =>
    apiClient.delete(API_ENDPOINTS.DELETE_REVIEW(id)),
};

// Health check
export const healthAPI = {
  check: () =>
    apiClient.get(API_ENDPOINTS.HEALTH),
};
