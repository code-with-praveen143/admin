const express = require("express");
const router = express.Router();
const pdfController = require("../controllers/pdfController");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
// const { authorizeRoles } = require("../middleware/authorizeRoles");

/**
 * @swagger
 * /api/pdfs:
 *   get:
 *     summary: Get PDF documents based on academic criteria
 *     tags: [PDFs]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Academic year of the PDFs
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *         description: Semester of the PDFs
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Subject of the PDFs
 *       - in: query
 *         name: unit
 *         schema:
 *           type: string
 *         description: Unit of the PDFs
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PdfDocument'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(
  "/",
  authMiddleware,
  // authorizeRoles("Admin", "Viewer"),
  pdfController.getAllPdfs
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     PDF:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         academicYear:
 *           type: object
 *           properties:
 *             year:
 *               type: string
 *             semester:
 *               type: string
 *         regulation:
 *           type: string
 *         course:
 *           type: string
 *         subject:
 *           type: string
 *         units:
 *           type: string
 *         files:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               filePath:
 *                 type: string
 *         uploadDate:
 *           type: string
 *           format: date-time
 * /api/pdfs:
 *   post:
 *     summary: Upload multiple PDFs
 *     tags: [PDFs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - academicYear.year
 *               - academicYear.semester
 *               - regulation
 *               - course
 *               - subject
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: PDF files to upload (max 10 files, 5MB each)
 *               academicYear.year:
 *                 type: string
 *                 enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
 *               academicYear.semester:
 *                 type: string
 *                 enum: ['1st Semester', '2nd Semester']
 *               regulation:
 *                 type: string
 *                 enum: ['R20', 'R21']
 *               course:
 *                 type: string
 *               subject:
 *                 type: string
 *               units:
 *                 type: string
 *                 enum: ["1st Unit", "2nd Unit", "3rd Unit", "4th Unit", "5th Unit"]
 *     responses:
 *       201:
 *         description: PDFs uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pdf:
 *                   $ref: '#/components/schemas/PDF'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */

router.post(
  "/",
  authMiddleware,
  // authorizeRoles("Admin", "faculty"),
  uploadMiddleware,
  pdfController.createPdfs
);

/**
 * @swagger
 * /api/pdfs/{id}:
 *   put:
 *     summary: Update a PDF document
 *     tags: [PDFs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               "academicYear.year":
 *                 type: string
 *               "academicYear.semester":
 *                 type: string
 *               regulation:
 *                 type: string
 *               course:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pdf:
 *                   $ref: '#/components/schemas/PdfDocument'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '404':
 *         description: PDF document not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *
 * components:
 *   schemas:
 *     PdfDocument:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         academicYear:
 *           type: object
 *           properties:
 *             year:
 *               type: string
 *             semester:
 *               type: string
 *         regulation:
 *           type: string
 *         course:
 *           type: string
 *         subject:
 *           type: string
 *         files:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *         uploadDate:
 *           type: string
 *           format: date-time
 */
router.put(
  "/:id",
  authMiddleware,
  // authorizeRoles("Admin", "Uploader"),
  // uploadMiddleware,
  pdfController.updatePdfById
);

/**
 * @swagger
 * /api/pdfs/{id}:
 *   delete:
 *     summary: Delete a PDF document
 *     tags: [PDFs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 */
router.delete(
  "/:id",
  authMiddleware,
  // authorizeRoles("Admin"),
  pdfController.deletePdfById
);

/**
 * @swagger
 * /api/pdfs/download/{id}/{fileIndex}:
 *   get:
 *     summary: Download a specific PDF file
 *     tags: [PDFs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: fileIndex
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  "/download/:id/:fileIndex",
  authMiddleware,
  // authorizeRoles("Admin", "Uploader", "Student"),
  pdfController.downloadPdf
);

/**
 * @swagger
 * /api/pdfs/download-all/{id}:
 *   get:
 *     summary: Download all PDFs for a document as ZIP
 *     tags: [PDFs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: ZIP file containing all PDFs
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  "/download-all/:id/:fileName",
  authMiddleware,
  // authorizeRoles("Admin", "Uploader"),
  pdfController.downloadAllPdfs
);

module.exports = router;
