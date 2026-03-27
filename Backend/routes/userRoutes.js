import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  validateUserRegister,
  validateUserLogin,
  validateForgotPassword,
  validateResetPassword,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateUserRegister, registerUser);
router.post("/login", validateUserLogin, loginUser);
router.post("/forgot-password", validateForgotPassword, requestPasswordReset);
router.post("/reset-password/:token", validateResetPassword, resetPassword);

// Protected routes
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);

export default router;
