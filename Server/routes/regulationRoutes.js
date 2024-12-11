const express = require("express");
const regulationController = require("../controllers/regulationController");
const router = express.Router();

/**
 * @swagger
 * /api/regulations:
 *   get:
 *     summary: Get all regulations
 *     tags: [Regulations]
 *     responses:
 *       200:
 *         description: A list of regulations
 *       500:
 *         description: Error fetching regulations
 */
router.get("/", regulationController.getAllRegulations);

/**
 * @swagger
 * /api/regulations/{id}:
 *   get:
 *     summary: Get Regulation by ID
 *     tags: [Regulations]
 *     responses:
 *       200:
 *         description: A regulation is returned
 *       500:
 *         description: Error fetching regulation
 */
router.get("/:id", regulationController.getRegulationById);

/**
 * @swagger
 * /api/regulations/category/{category}:
 *   get:
 *     summary: Get regulations by category
 *     tags: [Regulations]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: The category of regulations to fetch
 *     responses:
 *       200:
 *         description: A list of regulations in the specified category
 *       404:
 *         description: No regulations found for the category
 *       500:
 *         description: Error fetching regulations by category
 */
router.get(
  "/category/:category",
  regulationController.getRegulationsByCategory
);

/**
 * @swagger
 * /api/regulations:
 *   post:
 *     summary: Create a new regulation
 *     tags: [Regulations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Regulation'
 *     responses:
 *       201:
 *         description: The regulation was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Regulation'
 *       500:
 *         description: Some server error
 */
router.post("/", regulationController.createRegulation);

/**
 * @swagger
 * /api/regulations/{id}:
 *   put:
 *     summary: Update a regulation by id
 *     tags: [Regulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The regulation id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Regulation'
 *     responses:
 *       200:
 *         description: The regulation was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Regulation'
 *       404:
 *         description: The regulation was not found
 *       500:
 *         description: Some error happened
 */
router.put("/:id", regulationController.updateRegulationById);

/**
 * @swagger
 * /api/regulations/{id}:
 *   delete:
 *     summary: Remove the regulation by id
 *     tags: [Regulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The regulation id
 *     responses:
 *       200:
 *         description: The regulation was deleted
 *       404:
 *         description: The regulation was not found
 */
router.delete("/:id", regulationController.deleteRegulationById);

module.exports = router;
