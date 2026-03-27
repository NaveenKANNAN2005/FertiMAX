import { validateEmail, validatePhone } from "../utils/helpers.js";

// Validate user registration
export const validateUserRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must be at least 2 characters",
    });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email",
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  next();
};

// Validate user login
export const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email is required",
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Valid password is required",
    });
  }

  next();
};

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email is required",
    });
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  next();
};

// Validate product creation
export const validateProductCreate = (req, res, next) => {
  const { name, description, category, price, stockQuantity } = req.body;

  if (!name || name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Product name must be at least 3 characters",
    });
  }

  if (!description || description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: "Description must be at least 10 characters",
    });
  }

  if (!category) {
    return res.status(400).json({
      success: false,
      message: "Category is required",
    });
  }

  if (!price || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Valid price is required",
    });
  }

  if (typeof stockQuantity !== "number" || stockQuantity < 0) {
    return res.status(400).json({
      success: false,
      message: "Valid stock quantity is required",
    });
  }

  next();
};

// Validate review creation
export const validateReviewCreate = (req, res, next) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  }

  if (!comment || comment.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: "Comment must be at least 10 characters",
    });
  }

  next();
};
