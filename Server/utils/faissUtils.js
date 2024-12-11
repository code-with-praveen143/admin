const similarity = require("similarity");

let textChunks = [];

// Initialize by storing text chunks
const initialize = (chunks) => {
  textChunks = chunks;
};

// Find the most similar chunks
const search = (query, topK = 3) => {
  const scores = textChunks.map((chunk) => ({
    chunk,
    score: similarity(query, chunk),
  }));

  // Sort by similarity score in descending order and return topK
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.chunk);
};

module.exports = { initialize, search };
