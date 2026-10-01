"use strict";

/*
  Personal AI PA - Command Processor

  This file decides what the assistant should do
  with the user's message.

  For now, this is a free/local command system.
  Later, we can connect a real AI model here.
*/

async function processCommand({
  message,
  userId,
  assistant = {}
}) {
  const text = message.trim();
  const lower = text.toLowerCase();

  const assistantName =
    assistant.name || "Assistant";

  // -----------------------------
  // Greeting
  // -----------------------------

  if (
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower.includes("good morning") ||
    lower.includes("good evening")
  ) {
    return {
      reply: `Hello! I'm ${assistantName}. How can I help you?`,
      type: "conversation"
    };
  }

  // -----------------------------
  // Assistant identity
  // -----------------------------

  if (
    lower.includes("what is your name") ||
    lower.includes("your name")
  ) {
    return {
      reply: `My name is ${assistantName}. You can change my name anytime in Settings.`,
      type: "conversation"
    };
  }

  // -----------------------------
  // Time
  // -----------------------------

 if (
  lower.includes("what time") ||
  lower.includes("what is the time") ||
  lower.includes("current time") ||
  lower.includes("time now") ||
  lower.includes("what's the time") ||
  lower === "time" ||
  lower === "time?"
) {
  const now = new Date();

  return {
    reply: `The current time is ${now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}.`,
    type: "utility"
  };
}

  // -----------------------------
  // Date
  // -----------------------------

  if (
    lower.includes("what date") ||
    lower === "date" ||
    lower.includes("today's date")
  ) {
    const now = new Date();

    return {
      reply: `Today is ${now.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })}.`,
      type: "utility"
    };
  }

  // -----------------------------
  // Open websites
  // -----------------------------

  if (
    lower.includes("open youtube") ||
    lower.includes("open google") ||
    lower.includes("open instagram") ||
    lower.includes("open github")
  ) {
    let url = "";
    let siteName = "";

    if (lower.includes("youtube")) {
      url = "https://www.youtube.com";
      siteName = "YouTube";
    }

    if (lower.includes("google")) {
      url = "https://www.google.com";
      siteName = "Google";
    }

    if (lower.includes("instagram")) {
      url = "https://www.instagram.com";
      siteName = "Instagram";
    }

    if (lower.includes("github")) {
      url = "https://github.com";
      siteName = "GitHub";
    }

    return {
      reply: `Opening ${siteName}.`,
      type: "action",
      action: {
        type: "open_url",
        url
      }
    };
  }

  // -----------------------------
  // Remember something
  // -----------------------------

  if (
    lower.startsWith("remember that ") ||
    lower.startsWith("remember ")
  ) {
    let memoryText = text
      .replace(/^remember that /i, "")
      .replace(/^remember /i, "")
      .trim();

    if (memoryText) {
      return {
        reply: `I'll remember that: "${memoryText}"`,
        type: "memory",
        memory: {
          userId,
          text: memoryText
        }
      };
    }
  }

  // -----------------------------
  // Help
  // -----------------------------

  if (
    lower === "help" ||
    lower.includes("what can you do")
  ) {
    return {
      reply:
        `I can currently chat with you, tell you the date and time, ` +
        `open supported websites, and save simple memories. ` +
        `More abilities will be added to your Personal AI PA.`,
      type: "conversation"
    };
  }

  // -----------------------------
  // Default response
  // -----------------------------

  return {
    reply:
      `I understood your message: "${text}". ` +
      `My advanced AI brain isn't connected yet, but the foundation is ready.`,
    type: "conversation"
  };
}

module.exports = {
  processCommand
};
