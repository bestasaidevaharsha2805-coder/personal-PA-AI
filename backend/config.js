"use strict";

require("dotenv").config();

// -----------------------------
// Application configuration
// -----------------------------

const config = {
  // Server
  port: process.env.PORT || 3000,

  // Environment
  environment:
    process.env.NODE_ENV || "development",

  // AI provider
  aiProvider:
    process.env.AI_PROVIDER || "local",

  // AI API key
  // Keep this ONLY on the backend.
  aiApiKey:
    process.env.AI_API_KEY || "",

  // Application name
  appName:
    process.env.APP_NAME ||
    "Personal AI PA"
};

// -----------------------------
// Export configuration
// -----------------------------

module.exports = config;
