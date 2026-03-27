/**
 * Response Wrapper Utility
 * Standardizes all API responses across the backend
 */

export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

/**
 * Format success response
 * @param {number} statusCode - HTTP status code
 * @param {any} data - Response data
 * @param {string} message - Response message
 * @returns {Object} Formatted response
 */
export const successResponse = (statusCode = 200, data = null, message = "Success") => {
  return {
    success: true,
    statusCode,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format error response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} error - Error details (only in development)
 * @returns {Object} Formatted response
 */
export const errorResponse = (statusCode = 500, message = "Internal server error", error = null) => {
  const response = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development" && error) {
    response.error = {
      message: error.message,
      stack: error.stack,
    };
  }

  return response;
};

/**
 * Format paginated response
 * @param {number} statusCode - HTTP status code
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination info
 * @param {string} message - Response message
 * @returns {Object} Formatted response
 */
export const paginatedResponse = (
  statusCode = 200,
  data = [],
  pagination = {},
  message = "Success"
) => {
  return {
    success: true,
    statusCode,
    data,
    pagination: {
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      pages: pagination.pages || 1,
      hasNext: pagination.hasNext !== false,
      hasPrev: pagination.hasPrev !== false,
    },
    message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Middleware to attach response methods to res object
 */
export const responseMiddleware = (req, res, next) => {
  // Success response
  res.sendSuccess = (data = null, message = "Success", statusCode = 200) => {
    res.status(statusCode).json(successResponse(statusCode, data, message));
  };

  // Error response
  res.sendError = (message = "An error occurred", statusCode = 500, error = null) => {
    res.status(statusCode).json(errorResponse(statusCode, message, error));
  };

  // Paginated response
  res.sendPaginated = (data, pagination, message = "Success", statusCode = 200) => {
    res.status(statusCode).json(paginatedResponse(statusCode, data, pagination, message));
  };

  next();
};
