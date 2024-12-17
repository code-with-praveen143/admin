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

// Utility function to check for prohibited keywords
const containsProhibitedKeywords = (text) => {
  const prohibitedKeywords = [
    'tech stack',
    'technology',
    'framework',
    'library',
    'backend',
    'frontend',
    'programming language',
    'architecture',
    'database',
    'server',
    'api',
    'integration',
    'deployment',
    'CI/CD',
    'version control',
    'DevOps',
    'containerization',
    'microservices',
    'cloud services',
    'scalability',
    'security protocols',
    'data storage',
    'machine learning',
    'artificial intelligence',
    'natural language processing',
    'deep learning',
  ];
  const regex = new RegExp(`\\b(${prohibitedKeywords.join('|')})\\b`, 'i');
  return regex.test(text);
};

const chatController = {
  /**
   * Start a new chat session with specified filters.
   * @param {Object} req - The request object containing body with filters.
   * @returns {Object} - An object containing chatId, subject, regulation, and createdAt timestamp.
   */
  startChat: async ({ body }) => {
    const { year, semester, subject, units, userId, regulation } = body;

    // Validate required fields
    if (!year || !semester || !subject || !regulation || !userId) {
      throw new Error(
        "Year, semester, subject, regulation, units, and userId are required."
      );
    }

    // Mock request and response objects to fetch PDFs
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

    // Check if PDF fetching was successful
    if (mockRes.statusCode !== 200 || !mockRes.data) {
      throw new Error("Failed to fetch PDFs");
    }

    const pdfs = mockRes.data;

    // Ensure that PDFs are found
    if (pdfs.length === 0) {
      throw new Error("No PDFs found for the selected criteria.");
    }

    // Extract all relevant PDF URLs
    const RelevantPdfs = pdfs.flatMap((pdf) => pdf.files.map((file) => file.fileUrl));

    console.log("Relevant PDFs (URLs):", RelevantPdfs);

    // Create a new chat session
    const chat = new Chat({
      year,
      semester,
      subject,
      regulation,
      messages: [],
      relevantPdfs: RelevantPdfs, // Store all relevant PDF URLs
      userId: userId,
    });

    await chat.save();

    return { chatId: chat._id, subject, regulation, createdAt: chat.createdAt };
  },

  /**
   * Process a user's question within a chat session.
   * @param {Object} req - The request object containing body with chatId and question.
   * @returns {Object} - An object containing the AI's response.
   */
  askQuestion: async ({ body }) => {
    const { chatId, question } = body;

    // Validate required fields
    if (!chatId || !question) {
      throw new Error("Chat ID and question are required.");
    }

    // Retrieve the chat session from the database
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Chat session not found.");

    // Check for prohibited queries
    if (containsProhibitedKeywords(question)) {
      const warningMessage =
        "I'm sorry, but I can't provide information about my internal technologies or frameworks. How can I assist you with your studies or other inquiries?";

      // Log the user's question and the system's response
      chat.messages.push({
        role: "user",
        content: question,
        subjectDetails: {
          year: chat.year,
          semester: chat.semester,
          subject: chat.subject,
        },
      });

      chat.messages.push({
        role: "system",
        content: warningMessage,
        subjectDetails: {
          year: chat.year,
          semester: chat.semester,
          subject: chat.subject,
        },
      });

      await chat.save();

      return { response: warningMessage };
    }

    const pdfs = chat.relevantPdfs;

    // Ensure that there are relevant PDFs
    if (!pdfs || pdfs.length === 0) {
      throw new Error("No relevant PDFs found for this chat session.");
    }

    const pdfTextChunks = [];

    // Extract text from each PDF and split into manageable chunks
    for (const pdf of pdfs) {
      try {
        const text = await extractPdfText(pdf); // Assuming `extractPdfText` can handle URLs
        pdfTextChunks.push(...text.split("\n\n"));
      } catch (error) {
        console.error(`Error extracting text from PDF: ${pdf}`, error);
      }
    }

    // Generate embeddings for each PDF chunk
    const embeddings = await Promise.all(
      pdfTextChunks.map(async (chunk) => {
        try {
          const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunk,
          });
          return { embedding: response.data[0].embedding, chunk };
        } catch (error) {
          console.error("Error generating embedding for chunk:", error);
          return { embedding: [], chunk };
        }
      })
    );

    // Generate embedding for the user's question
    let questionVector;
    try {
      const questionEmbeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: question,
      });
      questionVector = questionEmbeddingResponse.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding for question:", error);
      throw new Error("Failed to process the question.");
    }

    // Calculate similarity scores between the question and each PDF chunk
    const scores = embeddings.map(({ embedding, chunk }) => ({
      chunk,
      score: cosineSimilarity(embedding, questionVector),
    }));

    // Select the top 3 most relevant chunks
    const topChunks = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.chunk);
    const relevantContext = topChunks.join("\n\n");

    // Generate a response using GPT-4 with the relevant context
    let answer;
    try {
      const chatGptResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Campusify Bot, a helpful assistant. 
                      You should provide clear and concise answers to the user's questions 
                      without revealing any information about your technical stack or internal implementations.`,
          },
          {
            role: "user",
            content: `Context:\n${relevantContext}\n\nQuestion: ${question}`,
          },
        ],
      });

      answer = chatGptResponse.choices[0].message.content;
    } catch (error) {
      console.error("Error generating response from GPT-4:", error);
      throw new Error("Failed to generate a response.");
    }

    // Log the user's question and the system's response
    chat.messages.push({
      role: "user",
      content: question,
      subjectDetails: {
        year: chat.year,
        semester: chat.semester,
        subject: chat.subject,
      },
    });

    chat.messages.push({
      role: "system",
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

  /**
   * Retrieve the chat history for a specific chat session.
   * @param {Object} req - The request object containing params with chatId and query with userId.
   * @returns {Object} - An object containing chatId, createdAt timestamp, messages, and userId.
   */
  getChatHistory: async ({ params, query }) => {
    const { chatId } = params;
    const { userId } = query;

    // Validate required fields
    if (!userId) {
      throw new Error("UserId is required");
    }

    // Retrieve the chat session ensuring it belongs to the user
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) throw new Error("Chat session not found.");

    return {
      chatId,
      createdAt: chat.createdAt,
      messages: chat.messages,
      userId: chat.userId,
    };
  },

  /**
   * Fetch all chat sessions for a specific user.
   * @param {Object} req - The request object containing params with userId.
   * @param {Object} res - The response object to send back the chat sessions or errors.
   */
  getChatByUser: async (req, res) => {
    const { userId } = req.params;

    try {
      // Fetch all chats for the user, sorted by latest first
      const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(chats);
    } catch (err) {
      console.error("Error fetching user chats:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = chatController;
