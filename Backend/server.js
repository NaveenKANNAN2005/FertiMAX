import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { errorHandler, requestLogger } from "./middleware/authMiddleware.js";
import { sanitizeInputs, checkSqlInjection } from "./middleware/sanitizer.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { responseMiddleware } from "./utils/response.js";
import { logger } from "./utils/logger.js";

import productRoutes from "./routes/productRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(checkSqlInjection);
app.use(sanitizeInputs);
app.use(apiLimiter);
app.use(responseMiddleware);
app.use(requestLogger);

app.use("/api/products", productRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminProductRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", oauthRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FertiMax Backend API",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      recommendations: "/api/recommendations",
      users: "/api/users",
      orders: "/api/orders",
      reviews: "/api/reviews",
      health: "/api/health",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info("FertiMax Backend Started", {
        port: PORT,
        environment: NODE_ENV,
        mongodbConnected: true,
        corsOrigin: process.env.FRONTEND_URL || "http://localhost:8080",
      });

      console.log(`FertiMax backend listening on port ${PORT} in ${NODE_ENV} mode.`);
    });
  } catch (error) {
    logger.error("Failed to start backend", { error: error.message });
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
