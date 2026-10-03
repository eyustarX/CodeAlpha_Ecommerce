const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors()); // Allow frontend to call our API
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CodeAlpha E-commerce API is healthy and running",
    timestamp: new Date().toISOString(),
  });
});

// API Base Route
app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to CodeAlpha E-commerce API v1",
  });
});

// Product routes
app.use("/api/v1/products", productRoutes);


// 404 & Centralized Error Handlers (must be registered LAST)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
