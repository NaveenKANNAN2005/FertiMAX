import express from "express";
import {
  verifyGoogleToken,
  exchangeGoogleCode,
  getGoogleOAuthConfig,
} from "../controllers/oauthController.js";

const router = express.Router();

/**
 * OAuth Routes
 */

// Verify Google ID token (Frontend sends token directly)
router.post("/google/verify-token", verifyGoogleToken);

// Exchange Google authorization code for token
router.post("/google/exchange-code", exchangeGoogleCode);

// Get OAuth configuration
router.get("/oauth-config", getGoogleOAuthConfig);

export default router;
