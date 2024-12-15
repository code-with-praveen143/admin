const OpenAIApi = require("openai");
const { extractPdfText } = require("../utils/pdfUtils");
const pdfController = require("./pdfController");
const Chat = require("../models/Chat");
require("dotenv").config();

const openai = new OpenAIApi.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utility function to calculate cosine similarity
const cosineSimilarity = (vec1, vec2) => {
  const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const magnitudeA = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const magnitudeB = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

const chatController = {
  // Start a chat session with filters
  startChat: async ({ body }) => {
    const { year, semester, subject, units, userId, regulation } = body;
  
    if (!year || !semester || !subject || !regulation || !userId) {
      throw new Error("Year, semester, subject, regulation, units, and userId are required.");
    }
  
    const mockReq = { query: { year, semester, subject, units } };
    const mockRes = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    };
  
    // Fetch PDFs using pdfController
    await pdfController.getAllPdfs(mockReq, mockRes);
  
    if (mockRes.statusCode !== 200 || !mockRes.data) {
      throw new Error("Failed to fetch PDFs");
    }
  
    const pdfs = mockRes.data;
  
    if (pdfs.length === 0) {
      throw new Error("No PDFs found for the selected criteria.");
    }
  
    // Extract file URLs directly
    const RelevantPdfs = pdfs.flatMap((pdf) => pdf.files.map((file) => file.fileUrl));
  
    const result = RelevantPdfs[0] // Logs each URL as a raw string
    console.log("Relevant PDFs (URLs):", result);

    // Create a new chat session
    const chat = new Chat({
      year,
      semester,
      subject,
      regulation,
      messages: [],
      relevantPdfs: result,
      userId: userId
    });
  
    await chat.save();
  
    return { chatId: chat._id, subject, regulation,createdAt: chat.createdAt };
  },
  
  
  

  // Process a user question
  askQuestion: async ({ body }) => {
    const { chatId, question } = body;

    if (!chatId || !question) {
      throw new Error("Chat ID and question are required.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Chat session not found.");

    const pdfs = chat.relevantPdfs;

    if (!pdfs || pdfs.length === 0) {
      throw new Error("No relevant PDFs found for this chat session.");
    }

    const pdfTextChunks = [];

    // Extract text from static PDF links (for demonstration)
    for (const pdf of pdfs) {
      const text = await extractPdfText(pdf); // Assuming `extractPdfText` can handle URLs
      pdfTextChunks.push(...text.split("\n\n"));
    }

    // Generate embeddings for PDF chunks
    const embeddings = await Promise.all(
      pdfTextChunks.map(async (chunk) => {
        const response = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk,
        });
        return { embedding: response.data[0].embedding, chunk };
      })
    );

    // Generate embedding for the question
    const questionEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: question,
    });
    const questionVector = questionEmbeddingResponse.data[0].embedding;

    // Calculate similarity scores
    const scores = embeddings.map(({ embedding, chunk }) => ({
      chunk,
      score: cosineSimilarity(embedding, questionVector),
    }));

    // Get top relevant chunks
    const topChunks = scores.sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.chunk);
    const relevantContext = topChunks.join("\n\n");

    // Generate response using GPT-4
    const chatGptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Context:\n${relevantContext}\n\nQuestion: ${question}` },
      ],
    });

    const answer = chatGptResponse.choices[0].message.content;

    // Add messages with the required fields
    chat.messages.push({
      role: "user", // Assuming role is 'user' for the question
      content: question,
      subjectDetails: {
        year: chat.year,
        semester: chat.semester,
        subject: chat.subject,
      },
    });

    chat.messages.push({
      role: "system", // The system (AI) is sending the answer
      content: answer,
      subjectDetails: {
        year: chat.year,
        semester: chat.semester,
        subject: chat.subject,
      },
    });

    await chat.save();

    return { response: answer };
  },

  // Fetch chat history
  getChatHistory: async ({ params, query }) => {
    const { chatId } = params;
    const { userId } = query;
    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }
    const chat = await Chat.findById({ _id: chatId, userId });
    if (!chat) throw new Error("Chat session not found.");

    return { chatId,createdAt: chat.createdAt, messages: chat.messages, userId: chat.userId};
  },
};

module.exports = chatController;
