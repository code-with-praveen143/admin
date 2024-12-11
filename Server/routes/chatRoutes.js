const express = require("express");
const chatController = require("../controllers/chatController");

const router = express.Router();

/**
 * @swagger
 * /api/chat/start:
 *   post:
 *     summary: Start a new chat session
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatStartRequest'
 *     responses:
 *       201:
 *         description: Chat session successfully started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Bad request
 */
router.post("/start", async (req, res) => {
  try {
    const response = await chatController.startChat(req);
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/chat/ask:
 *   post:
 *     summary: Ask a question in a chat
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatAskRequest'
 *     responses:
 *       200:
 *         description: Question successfully answered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Bad request
 */
router.post("/ask", async (req, res) => {
  try {
    const response = await chatController.askQuestion(req);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/chat/{chatId}/history:
 *   get:
 *     summary: Get chat history
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the chat session
 *     responses:
 *       200:
 *         description: Successfully retrieved chat history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatHistoryResponse'
 *       400:
 *         description: Bad request
 */
router.get("/:chatId/history", async (req, res) => {
  try {
    const response = await chatController.getChatHistory(req);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatStartRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user starting the chat
 *       example:
 *         userId: abc123
 *     ChatAskRequest:
 *       type: object
 *       required:
 *         - chatId
 *         - question
 *       properties:
 *         chatId:
 *           type: string
 *           description: The ID of the chat session
 *         question:
 *           type: string
 *           description: The question being asked
 *       example:
 *         chatId: xyz789
 *         question: What is the weather today?
 *     ChatResponse:
 *       type: object
 *       properties:
 *         chatId:
 *           type: string
 *           description: The ID of the chat session
 *         message:
 *           type: string
 *           description: The response message
 *       example:
 *         chatId: xyz789
 *         message: "The weather today is sunny."
 *     ChatHistoryResponse:
 *       type: object
 *       properties:
 *         chatId:
 *           type: string
 *           description: The ID of the chat session
 *         history:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question asked
 *               answer:
 *                 type: string
 *                 description: The response to the question
 *       example:
 *         chatId: xyz789
 *         history:
 *           - question: "What is the weather today?"
 *             answer: "The weather today is sunny."
 */

module.exports = router;
