"use strict";

const fs = require("fs");
const path = require("path");

// -----------------------------
// Memory file location
// -----------------------------

const dataFolder = path.join(__dirname, "..", "data");
const memoryFile = path.join(dataFolder, "memory.json");

// -----------------------------
// Make sure data folder exists
// -----------------------------

function ensureMemoryFile() {
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, {
      recursive: true
    });
  }

  if (!fs.existsSync(memoryFile)) {
    fs.writeFileSync(
      memoryFile,
      "[]",
      "utf8"
    );
  }
}

// -----------------------------
// Read all memories
// -----------------------------

function readMemories() {
  ensureMemoryFile();

  try {
    const data = fs.readFileSync(
      memoryFile,
      "utf8"
    );

    return JSON.parse(data);
  } catch (error) {
    console.error("Memory read error:", error);

    return [];
  }
}

// -----------------------------
// Save all memories
// -----------------------------

function writeMemories(memories) {
  ensureMemoryFile();

  fs.writeFileSync(
    memoryFile,
    JSON.stringify(memories, null, 2),
    "utf8"
  );
}

// -----------------------------
// Get memories for a user
// -----------------------------

async function getMemories(userId) {
  const memories = readMemories();

  return memories.filter(
    (memory) => memory.userId === userId
  );
}

// -----------------------------
// Add a new memory
// -----------------------------

async function addMemory(userId, text) {
  const memories = readMemories();

  const memory = {
    id:
      Date.now().toString() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 9),

    userId,

    text,

    createdAt:
      new Date().toISOString()
  };

  memories.push(memory);

  writeMemories(memories);

  return memory;
}

// -----------------------------
// Delete a memory
// -----------------------------

async function deleteMemory(
  userId,
  memoryId
) {
  const memories = readMemories();

  const originalLength =
    memories.length;

  const filtered =
    memories.filter(
      (memory) =>
        !(
          memory.id === memoryId &&
          memory.userId === userId
        )
    );

  writeMemories(filtered);

  return (
    filtered.length <
    originalLength
  );
}

// -----------------------------
// Export functions
// -----------------------------

module.exports = {
  getMemories,
  addMemory,
  deleteMemory
};
