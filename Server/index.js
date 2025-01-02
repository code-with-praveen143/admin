const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { swaggerUi, swaggerSpecs } = require("./swagger/swagger");
const connectDB = require("./config/db"); // MongoDB connection
const logger = require("./config/logger"); // Logger
const { requestLogger, ipLogger } = require("./middleware/requestLogger"); // Middleware
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

const collegeRoutes = require("./routes/collegeRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const cardRoutes = require("./routes/cardRoute");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const regulationRoutes = require("./routes/regulationRoutes");
const userRoutes = require("./routes/usersRoutes");
const chatRoutes = require("./routes/chatRoutes");
const previousPaperRoutes = require("./routes/previousPaperRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const feedbackRoutes = require("./routes/feedbackRoute");

const chatController = require("./controllers/chatController");

const app = express();
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001", // Localhost frontend
      "https://community.campusify.io", // Vercel deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  maxHttpBufferSize: 1e8, // 100MB
});

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3001", // Localhost frontend
      "https://community.campusify.io", // Vercel deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors()); // Enable preflight requests for all routes

app.use(express.json({ limit: "100mb" })); // Adjust the size as needed
app.use(express.urlencoded({ extended: false, limit: "100mb" }));

connectDB();

// Request logging middleware
app.use(requestLogger);
app.use(ipLogger);

// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", collegeRoutes);
app.use("/api", cardRoutes);
app.use("/api", studentRoutes);
app.use("/api/regulations", regulationRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api/previouspapers", previousPaperRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);

// Socket.IO integration
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("start-chat", async (data) => {
    try {
      const { year, semester, subject, unit } = data;
      if (!year || !semester || !subject || !unit) {
        socket.emit("error", "All fields (Year, Semester, Subject, Unit) are required.");
        return;
      }
      const chat = await chatController.startChat({ body: { year, semester, subject, unit } });
      socket.emit("chat-started", chat);
    } catch (err) {
      console.error("Error starting chat:", err);
      socket.emit("error", "Failed to start chat session.");
    }
  });

  socket.on("ask-question", async (data) => {
    try {
      const { chatId, question } = data;
      if (!chatId || !question) {
        socket.emit("error", "Chat ID and question are required.");
        return;
      }
      const response = await chatController.askQuestion({ body: { chatId, question } });
      socket.emit("chat-response", response);
    } catch (err) {
      console.error("Error processing question:", err);
      socket.emit("error", "Failed to process the question.");
    }
  });

  socket.on("get-chat-history", async (data) => {
    try {
      const { chatId } = data;
      if (!chatId) {
        socket.emit("error", "Chat ID is required to fetch chat history.");
        return;
      }
      const chatHistory = await chatController.getChatHistory({ params: { chatId } });
      socket.emit("chat-history", chatHistory);
    } catch (err) {
      console.error("Error fetching chat history:", err);
      socket.emit("error", "Failed to retrieve chat history.");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

// Log unhandled promise rejections
process.on("unhandledRejection", (error) => {
  logger.error(`Unhandled Rejection: ${error.message}`);
});

// Log uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
});
