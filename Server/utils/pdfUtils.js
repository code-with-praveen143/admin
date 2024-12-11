const pdfParse = require("pdf-parse");

// Extract text from PDF buffer
const extractPdfText = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

module.exports = { extractPdfText };
