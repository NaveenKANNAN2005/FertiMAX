import validator from "validator";
import { logger } from "../utils/logger.js";

/**
 * Sanitize all string inputs to prevent XSS and injection attacks
 */
export const sanitizeInputs = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query
    if (req.query && typeof req.query === "object") {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize params
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error("Sanitization error:", error);
    next(); // Continue even if sanitization fails
  }
};

/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj) => {
  const sanitized = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (value === null || value === undefined) {
        sanitized[key] = value;
      } else if (typeof value === "string") {
        // Escape HTML entities and trim whitespace
        sanitized[key] = validator.escape(value.trim());
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        // Sanitize array items
        sanitized[key] = value.map((item) => {
          if (typeof item === "string") {
            return validator.escape(item.trim());
          } else if (typeof item === "object" && item !== null) {
            return sanitizeObject(item);
          }
          return item;
        });
      } else {
        // Keep non-string non-object values as is
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate phone format
 */
export const validatePhone = (phone) => {
  return validator.isMobilePhone(phone);
};

/**
 * Validate URL
 */
export const validateURL = (url) => {
  return validator.isURL(url);
};

/**
 * Validate strong password
 */
export const validateStrongPassword = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

/**
 * Escape special characters for database queries
 */
export const escapeDbInput = (input) => {
  if (typeof input !== "string") {
    return input;
  }

  return input
    .replace(/\\/g, "\\\\") // Backslash
    .replace(/\$/g, "\\$") // Dollar sign
    .replace(/"/g, '\\"') // Double quote
    .replace(/'/g, "\\'"); // Single quote
};

/**
 * Remove potentially dangerous properties from objects
 */
export const removeDangerousProps = (obj, dangerousProps = ["password", "salt", "__v"]) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeDangerousProps(item, dangerousProps));
  }

  const result = { ...obj };
  dangerousProps.forEach((prop) => {
    delete result[prop];
  });

  return result;
};

/**
 * Validate input length
 */
export const validateLength = (input, min, max) => {
  if (!input) return false;
  const length = input.toString().length;
  return length >= min && length <= max;
};

/**
 * Check if input contains SQL injection patterns
 */
export const hasSqlInjection = (input) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
    /(-{2}|\/\*|\*\/|;|\|{2}|&&)/,
    /(xp_|sp_)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
};

/**
 * Middleware to check for SQL injection attempts
 */
export const checkSqlInjection = (req, res, next) => {
  const checkValue = (value) => {
    if (typeof value === "string" && hasSqlInjection(value)) {
      logger.warn("Potential SQL injection detected:", { value, ip: req.ip });
      return true;
    }
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const hasInjection =
    checkValue(req.body) || checkValue(req.query) || checkValue(req.params);

  if (hasInjection) {
    return res.status(400).json({
      success: false,
      message: "Invalid input detected",
      statusCode: 400,
    });
  }

  next();
};
