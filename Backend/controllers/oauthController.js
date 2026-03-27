import { promisify } from "util";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { hashPassword, generateToken } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Google OAuth Controller
 * Handles Google authentication and token verification
 */

// Verify Google token and create/update user
export const verifyGoogleToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture, email_verified } = payload;

    // Check if email is verified
    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email with Google first",
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      // Update Google ID if not already set
      if (!user.googleId) {
        user.googleId = sub;
        user.profilePicture = picture;
        await user.save();
      }
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId: sub,
        profilePicture: picture,
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        farmSize: 0,
        cropTypes: [],
        soilType: "",
        role: "farmer",
        isActive: true,
        // Set a random password for security (won't be used for Google auth)
        password: await hashPassword(Math.random().toString(36).slice(-20)),
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id, user.email, user.role);

    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: {
        token: jwtToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          farmSize: user.farmSize,
          cropTypes: user.cropTypes,
          soilType: user.soilType,
        },
      },
    });
  } catch (error) {
    logger.error("Google token verification failed:", error);

    // Check if it's a timeout or verification error
    if (error.message?.includes("Timeout")) {
      return res.status(408).json({
        success: false,
        message: "Token verification took too long. Please try again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Invalid Google token or verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

/**
 * Exchange Google Authorization Code for tokens
 * (Alternative method using OAuth2 code flow)
 */
export const exchangeGoogleCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email with Google first",
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = sub;
        user.profilePicture = picture;
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        name,
        email,
        googleId: sub,
        profilePicture: picture,
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        farmSize: 0,
        cropTypes: [],
        soilType: "",
        role: "farmer",
        isActive: true,
        password: await hashPassword(Math.random().toString(36).slice(-20)),
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id, user.email, user.role);

    res.status(200).json({
      success: true,
      message: "Google authorization successful",
      data: {
        token: jwtToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          farmSize: user.farmSize,
          cropTypes: user.cropTypes,
          soilType: user.soilType,
        },
      },
    });
  } catch (error) {
    logger.error("Google code exchange failed:", error);
    res.status(401).json({
      success: false,
      message: "Failed to authenticate with Google",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

/**
 * Get Google OAuth config (for frontend)
 * Returns public configuration needed by frontend
 */
export const getGoogleOAuthConfig = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        scope: ["profile", "email"],
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
      },
    });
  } catch (error) {
    logger.error("Failed to get OAuth config:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get OAuth configuration",
    });
  }
};
