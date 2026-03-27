// Error handling utility
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const formatErrorResponse = (error) => {
  return {
    success: false,
    message: error.message || "Internal server error",
    status: error.statusCode || 500,
  };
};
