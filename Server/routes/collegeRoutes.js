const express = require("express");
const collegeController = require("../controllers/collegeController");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Colleges
 *   description: API to manage colleges
 */

/**
 * @swagger
 * /api/colleges:
 *   post:
 *     summary: Create a new college
 *     tags: [Colleges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collegeName:
 *                 type: string
 *               regulatoryBody:
 *                 type: string
 *               domain:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     address:
 *                       type: string
 *                     contactNumber:
 *                       type: string
 *                     email:
 *                       type: string
 *               programs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     years:
 *                       type: array
 *                       items:
 *                         type: number
 *                     regulations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           regulation:
 *                             type: string
 *                           validYears:
 *                             type: array
 *                             items:
 *                               type: number
 *     responses:
 *       201:
 *         description: College created successfully
 *       500:
 *         description: Error creating college
 */
router.post("/colleges", authMiddleware, collegeController.createCollege);

/**
 * @swagger
 * /api/colleges:
 *   get:
 *     summary: Get all colleges
 *     tags: [Colleges]
 *     responses:
 *       200:
 *         description: A list of colleges
 *       500:
 *         description: Error fetching colleges
 */
router.get("/colleges",collegeController.getAllColleges);

/**
 * @swagger
 * /api/colleges/{id}:
 *   get:
 *     summary: Get a college by ID
 *     tags: [Colleges]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: College ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: College details
 *       404:
 *         description: College not found
 */
router.get("/colleges/:id", collegeController.getCollegeById);

/**
 * @swagger
 * /api/colleges/name/{collegeName}:
 *   get:
 *     summary: Get a college by name
 *     tags: [Colleges]
 *     parameters:
 *       - name: collegeName
 *         in: path
 *         required: true
 *         description: Name of the college
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: College details
 *       404:
 *         description: College not found
 */
router.get(
  "/colleges/name/:collegeName",
 
  collegeController.getCollegeByCollegeName
);

/**
 * @swagger
 * /api/colleges/{id}:
 *   put:
 *     summary: Update a college by ID
 *     tags: [Colleges]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: College ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collegeName:
 *                 type: string
 *               regulatoryBody:
 *                 type: string
 *               domain:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     address:
 *                       type: string
 *                     contactNumber:
 *                       type: string
 *                     email:
 *                       type: string
 *               programs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     years:
 *                       type: array
 *                       items:
 *                         type: number
 *                     regulations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           regulation:
 *                             type: string
 *                           validYears:
 *                             type: array
 *                             items:
 *                               type: number
 *     responses:
 *       200:
 *         description: College updated successfully
 *       404:
 *         description: College not found
 */
router.put(
  "/colleges/:id",
  authMiddleware,
  collegeController.updateCollegeById
);

/**
 * @swagger
 * /api/colleges/name/{collegeName}:
 *   put:
 *     summary: Update a college by name
 *     tags: [Colleges]
 *     parameters:
 *       - name: collegeName
 *         in: path
 *         required: true
 *         description: Name of the college
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               regulatoryBody:
 *                 type: string
 *               domain:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *               programs:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: College updated successfully
 *       404:
 *         description: College not found
 */
router.put(
  "/colleges/name/:collegeName",
  authMiddleware,
  collegeController.updateCollegeByCollegeName
);

/**
 * @swagger
 * /api/colleges/{id}:
 *   delete:
 *     summary: Delete a college by ID
 *     tags: [Colleges]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: College ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: College deleted successfully
 *       404:
 *         description: College not found
 */
router.delete(
  "/colleges/:id",
  authMiddleware,
  collegeController.deleteCollegeById
);

/**
 * @swagger
 * /api/colleges/name/{collegeName}:
 *   delete:
 *     summary: Delete a college by name
 *     tags: [Colleges]
 *     parameters:
 *       - name: collegeName
 *         in: path
 *         required: true
 *         description: Name of the college
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: College deleted successfully
 *       404:
 *         description: College not found
 */
router.delete(
  "/colleges/name/:collegeName",
  authMiddleware,
  collegeController.deleteCollegeByCollegeName
);

/**
 * @swagger
 * /api/colleges/{id}/programs:
 *   get:
 *     summary: Get all programs for a college
 *     tags: [Colleges]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: College ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of programs
 *       404:
 *         description: College not found
 */
router.get(
  "/colleges/:id/programs",
  collegeController.getCollegePrograms
);

/**
 * @swagger
 * /api/colleges/{id}/programs:
 *   post:
 *     summary: Add a new program to a college
 *     tags: [Colleges]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: College ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *               years:
 *                 type: array
 *                 items:
 *                   type: number
 *               regulations:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Program added successfully
 *       404:
 *         description: College not found
 */
router.post(
  "/colleges/:id/programs",
  authMiddleware,
  collegeController.addProgram
);

/**
 * @swagger
 * /api/colleges/search:
 *   get:
 *     summary: Search colleges by various criteria
 *     tags: [Colleges]
 *     parameters:
 *       - name: regulatoryBody
 *         in: query
 *         schema:
 *           type: string
 *       - name: program
 *         in: query
 *         schema:
 *           type: string
 *       - name: specialization
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching colleges
 */
router.get(
  "/colleges/search",
  collegeController.searchColleges
);

/**
 * @swagger
 * /api/colleges/{id}/regulations:
 *   post:
 *     summary: Add a new regulation to a program
 *     tags: [Colleges]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: College ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               programName:
 *                 type: string
 *               regulation:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   regulation:
 *                     type: string
 *                   validYears:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       200:
 *         description: Regulation added successfully
 *       404:
 *         description: College or program not found
 */
router.post(
  "/colleges/:id/regulations",
  authMiddleware,
  collegeController.addRegulation
);

module.exports = router;
