import User from "../models/User.js";
import { hashPassword, comparePassword, generateToken } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";
import crypto from "crypto";

// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      city,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    logger.info("User registered successfully", { email: user.email });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          farmSize: user.farmSize,
          cropTypes: user.cropTypes,
          soilType: user.soilType,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error("Registration error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    logger.info("User logged in successfully", { email: user.email });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          role: user.role,
          profilePicture: user.profilePicture,
          farmSize: user.farmSize,
          cropTypes: user.cropTypes,
          soilType: user.soilType,
        },
      },
    });
  } catch (error) {
    logger.error("Login error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Get profile error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, zipCode, farmSize, cropTypes, soilType } =
      req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        address,
        city,
        state,
        zipCode,
        farmSize,
        cropTypes,
        soilType,
      },
      { new: true, runValidators: true }
    ).select("-password");

    logger.info("User profile updated", { userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    logger.error("Update profile error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
      const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

      logger.info("Password reset requested", {
        userId: user._id,
        email: user.email,
        resetUrl,
      });

      return res.status(200).json({
        success: true,
        message: "If the account exists, password reset instructions have been generated.",
        data:
          process.env.NODE_ENV !== "production"
            ? {
                resetUrl,
                resetToken: rawToken,
              }
            : undefined,
      });
    }

    res.status(200).json({
      success: true,
      message: "If the account exists, password reset instructions have been generated.",
    });
  } catch (error) {
    logger.error("Forgot password error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = await hashPassword(req.body.password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info("Password reset completed", {
      userId: user._id,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    logger.error("Reset password error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
