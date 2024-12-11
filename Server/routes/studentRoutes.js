const express = require("express");
const studentController = require("../controllers/studentController");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: API to manage students
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: A list of students
 *       500:
 *         description: Error fetching students
 */
router.get("/students", authMiddleware, studentController.getAllStudents);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get a single student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student data
 *       404:
 *         description: Student not found
 *       500:
 *         description: Error fetching student
 */
router.get("/students/:id", authMiddleware, studentController.getStudentById);

/**
 * @swagger
 * /api/students/multiple:
 *   post:
 *     summary: Get multiple students by their IDs
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of student IDs
 *     responses:
 *       200:
 *         description: List of students
 *       400:
 *         description: IDs should be an array
 *       500:
 *         description: Error fetching students
 */
router.post(
  "/students/multiple",
  authMiddleware,
  studentController.getStudentsByIds
);

/**
 * @swagger
 * /api/events/register:
 *   post:
 *     summary: Register student for an event
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               eventId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student successfully registered for the event
 *       400:
 *         description: Student already registered or other validation error
 *       500:
 *         description: Error registering student for event
 */
router.post(
  "/events/register",
  authMiddleware,
  studentController.registerStudentForEvent
);

module.exports = router;
