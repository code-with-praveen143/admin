const express = require("express");
const router = express.Router();
const multer = require("multer");
const eventController = require("../controllers/eventcontroller");
const studentController = require("../controllers/studentController");

// const {authMiddleware} = require('../middleware/authMiddleware')

// Configure multer storage for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Ensure the 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}.${file.originalname.split(".").pop()}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."), false);
    }
  },
});
/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - collegeName
 *               - street
 *               - city
 *               - state
 *               - zip
 *               - startDate
 *               - startTime
 *               - endDate
 *               - endTime
 *               - thumbnail
 *               - eventSpeaker
 *               - modeOfEvent
 *             properties:
 *               title:
 *                 type: string
 *               collegeName:
 *                 type: string
 *               street:
 *                 type: string
 *                 description: Street address
 *               city:
 *                 type: string
 *                 description: City name
 *               state:
 *                 type: string
 *                 description: State name
 *               zip:
 *                 type: string
 *                 description: ZIP code
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Event start date (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 format: time
 *                 description: Event start time (HH:mm)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Event end date (YYYY-MM-DD)
 *               endTime:
 *                 type: string
 *                 format: time
 *                 description: Event end time (HH:mm)
 *               modeOfEvent:
 *                 type: string
 *                 enum: [online, offline, hybrid]
 *                 default: offline
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               eventSpeaker:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", upload.single("thumbnail"), eventController.createEvent);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get("/", eventController.getAllEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.get("/:id", eventController.getEventById);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               collegeName:
 *                 type: string
 *               address.street:
 *                 type: string
 *               address.city:
 *                 type: string
 *               address.state:
 *                 type: string
 *               address.zip:
 *                 type: string
 *               time.startDate:
 *                 type: string
 *                 format: date
 *               time.startTime:
 *                 type: string
 *                 format: time
 *               time.endDate:
 *                 type: string
 *                 format: date
 *               time.endTime:
 *                 type: string
 *                 format: time
 *               modeOfEvent:
 *                 type: string
 *                 enum: [online, offline, hybrid]
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               eventSpeaker:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.put("/:id", upload.single("thumbnail"), eventController.updateEventById);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete("/:id", eventController.deleteEventById);

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
router.post("/events/register", studentController.registerStudentForEvent);

module.exports = router;
