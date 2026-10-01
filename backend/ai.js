"use strict";

/*
  Personal AI PA - AI Brain

  This file is intentionally separated from the server.

  Later we can connect:
  - OpenAI
  - Anthropic
  - Google Gemini
  - Another AI provider
  - A local AI model

  Your frontend and server won't need to be rebuilt
  when we change the AI provider.
*/

// -----------------------------
// Local fallback AI
// -----------------------------

async function generateAIResponse({
  message,
  assistant = {},
  memories = []
}) {
  const assistantName =
    assistant.name || "Assistant";

  const personality =
    assistant.personality ||
    "helpful, friendly and professional";

  // Simple local response for now
  const lower = message.toLowerCase();

  if (
    lower.includes("who are you") ||
    lower.includes("what are you")
  ) {
    return {
      reply:
        `I'm ${assistantName}, your personal AI assistant. ` +
        `My personality is set to be ${personality}.`
    };
  }

  if (
    lower.includes("thank you") ||
    lower.includes("thanks")
  ) {
    return {
      reply:
        `You're welcome! I'm always here to help.`
    };
  }

  if (
    lower.includes("good morning")
  ) {
    return {
      reply:
        `Good morning! Let's make today productive.`
    };
  }

  if (
    lower.includes("good night")
  ) {
    return {
      reply:
        `Good night! Have a peaceful rest.`
    };
  }

  // -----------------------------
  // Memory-aware response
  // -----------------------------

  if (memories.length > 0) {
    return {
      reply:
        `I'm ${assistantName}. I received your message: ` +
        `"${message}". I also have ${memories.length} ` +
        `saved memory${memories.length === 1 ? "" : "ies"} for you.`
    };
  }

  // -----------------------------
  // Default
  // -----------------------------

  return {
    reply:
      `I'm ${assistantName}. I understood your message: ` +
      `"${message}". My advanced AI model connection isn't ` +
      `enabled yet, but the AI layer is ready for integration.`
  };
}

// -----------------------------
// Future AI provider function
// -----------------------------

async function askAI({
  message,
  assistant,
  memories
}) {
  /*
    Later, the real AI provider will be called here.

    Example architecture:

    User
      ↓
    server.js
      ↓
    commands.js
      ↓
    ai.js
      ↓
    AI Provider
      ↓
    ai.js
      ↓
    server.js
      ↓
    User
  */

  return generateAIResponse({
    message,
    assistant,
    memories
  });
}

// -----------------------------
// Export
// -----------------------------

module.exports = {
  generateAIResponse,
  askAI
};
