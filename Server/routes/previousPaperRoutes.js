const express = require("express");
const router = express.Router();
const previousPaperController = require("../controllers/previousPapersController");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, previousPaperController.getAllPreviousPapers);

router.post("/", authMiddleware, uploadMiddleware, previousPaperController.createPreviousPapers);


module.exports = router;

