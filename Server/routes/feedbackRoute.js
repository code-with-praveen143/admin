const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit feedback
 *     tags: [Feedback]
 *     description: Allows a user to submit feedback with a message, username, and user ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - username
 *               - user_id
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Great application! Keep up the good work."
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               user_id:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback submitted successfully."
 *                 feedback:
 *                   type: object
 *       400:
 *         description: Bad request (missing fields)
 *       500:
 *         description: Internal server error
 */
router.post("/", feedbackController.createFeedback);

/**
 * @swagger
 * /api/feedback/{feedbackId}:
 *   get:
 *     summary: Get feedback by feedback ID
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the feedback
 *     responses:
 *       200:
 *         description: Successfully retrieved feedback
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.get("/:feedbackId", feedbackController.getFeedbackById);

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Get feedbacks
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: Successfully retrieved user feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       500:
 *         description: Internal server error
 */
router.get("/", feedbackController.getFeedbacks);


/**
 * @swagger
 * /api/feedback/user/{userId}:
 *   get:
 *     summary: Get feedback by user ID
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved user feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       500:
 *         description: Internal server error
 */
router.get("/user/:userId", feedbackController.getFeedbackByUserId);

/**
 * @swagger
 * /api/feedback/username/{username}:
 *   get:
 *     summary: Get feedback by username
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved user feedback by username
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       500:
 *         description: Internal server error
 */
router.get("/username/:username", feedbackController.getFeedbackByUsername);

module.exports = router;
