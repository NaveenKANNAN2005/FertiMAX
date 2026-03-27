import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

// Verify JWT token
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Authentication failed", { error: error.message });
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Check if user is admin
export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// Check if user is admin
export const authorize = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  logger.error("Request error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
  });
  next();
};
