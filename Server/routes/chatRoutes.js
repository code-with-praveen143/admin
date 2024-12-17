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
 *     summary: Get chat history for a specific user and chat session
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the chat session
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user requesting the chat history
 *     responses:
 *       200:
 *         description: Successfully retrieved chat history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatHistoryResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Chat or user not found
 *       500:
 *         description: Internal server error
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
 * /api/chat/{userId}:
 *   get:
 *     summary: Get all chats by a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose chats are being fetched
 *     responses:
 *       200:
 *         description: Successfully retrieved user chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatResponse'
 *       404:
 *         description: User not found or no chats available
 *       500:
 *         description: Internal server error
 */

router.get("/:userId", chatController.getChatByUser);


module.exports = router;
