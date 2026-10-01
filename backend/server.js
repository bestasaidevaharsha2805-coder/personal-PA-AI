"use strict";

require("dotenv").config();

const express = require("express");
const path = require("path");

const { processCommand } = require("./commands");
const {
  getMemories,
  addMemory,
  deleteMemory
} = require("./memory");

const app = express();

const PORT = process.env.PORT || 3000;

// -----------------------------
// Basic configuration
// -----------------------------

app.use(
  express.json({
    limit: "1mb"
  })
);

// -----------------------------
// Health check
// -----------------------------

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Personal AI PA backend is online"
  });
});

// -----------------------------
// AI Chat
// -----------------------------

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      userId,
      assistant = {}
    } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const result = await processCommand({
      message,
      userId,
      assistant
    });

    res.json(result);
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "Something went wrong while processing your message."
    });
  }
});

// -----------------------------
// Get memories
// -----------------------------

app.get("/api/memory", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required."
      });
    }

    const memories = await getMemories(userId);

    res.json({
      memories
    });
  } catch (error) {
    console.error("Memory error:", error);

    res.status(500).json({
      error: "Unable to load memories."
    });
  }
});

// -----------------------------
// Add memory
// -----------------------------

app.post("/api/memory", async (req, res) => {
  try {
    const {
      userId,
      text
    } = req.body;

    if (!userId || !text) {
      return res.status(400).json({
        error: "userId and text are required."
      });
    }

    const memory = await addMemory(userId, text);

    res.json({
      success: true,
      memory
    });
  } catch (error) {
    console.error("Add memory error:", error);

    res.status(500).json({
      error: "Unable to save memory."
    });
  }
});

// -----------------------------
// Delete memory
// -----------------------------

app.delete("/api/memory/:id", async (req, res) => {
  try {
    const {
      userId
    } = req.body;

    const memoryId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required."
      });
    }

    const deleted = await deleteMemory(
      userId,
      memoryId
    );

    res.json({
      success: deleted
    });
  } catch (error) {
    console.error("Delete memory error:", error);

    res.status(500).json({
      error: "Unable to delete memory."
    });
  }
});

// -----------------------------
// Serve the frontend
// -----------------------------

const frontendPath = path.join(
  __dirname,
  ".."
);

app.use(
  express.static(frontendPath, {
    dotfiles: "deny"
  })
);

// -----------------------------
// Start server
// -----------------------------

app.listen(PORT, () => {
  console.log(
    `Personal AI PA running on port ${PORT}`
  );
});
