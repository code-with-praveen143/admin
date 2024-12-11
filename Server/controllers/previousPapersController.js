const PreviousPaperUpload = require("../models/PreviousPapers");
const fs = require("fs/promises");
const path = require("path");

const previousPaperController = {
  createPreviousPapers: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Please upload at least one PDF file" });
      }

      if (req.files.length > 5) {
        return res.status(400).json({ error: "You can upload up to 5 PDF files at a time" });
      }

      const metadata = JSON.parse(req.body.metadata);
      const {
        academicYear: { year, semester },
        regulation,
        course,
        subject,
        examDate,
      } = metadata;

      if (!year || !semester || !regulation || !course || !subject || !examDate) {
        return res.status(400).json({
          error: "Academic year, semester, regulation, course, subject, and exam date are required",
        });
      }

      const invalidFiles = req.files.filter(
        (file) => file.mimetype !== "application/pdf"
      );
      if (invalidFiles.length > 0) {
        return res.status(400).json({
          error: "Only PDF files are allowed",
          invalidFiles: invalidFiles.map((f) => f.originalname),
        });
      }

      const uploadDir = path.join(__dirname, "../uploaders");
      await fs.mkdir(uploadDir, { recursive: true });

      const id = Date.now();
      const files = req.files.map((file) => ({
        fileName: file.originalname,
        fileData: file.buffer,
      }));

      const newPreviousPaper = new PreviousPaperUpload({
        id,
        academicYear: { year, semester },
        regulation,
        course,
        subject,
        examDate,
        files,
      });

      await newPreviousPaper.save();

      res.status(201).json({
        message: "Previous papers uploaded successfully",
        previousPaper: {
          id: newPreviousPaper.id,
          academicYear: newPreviousPaper.academicYear,
          regulation: newPreviousPaper.regulation,
          course: newPreviousPaper.course,
          subject: newPreviousPaper.subject,
          examDate: newPreviousPaper.examDate,
          fileNames: newPreviousPaper.files.map((f) => f.fileName),
          uploadDate: newPreviousPaper.uploadDate,
        },
      });
    } catch (err) {
      console.error("Error uploading previous papers:", err);
      res.status(500).json({ error: "Failed to upload previous papers" });
    }
  },

  getAllPreviousPapers: async (req, res) => {
    try {
      const { year, semester, subject, examYear, examMonth } = req.query;
      let query = {};

      if (year) query["academicYear.year"] = year;
      if (semester) query["academicYear.semester"] = semester;
      if (subject) query.subject = subject;
      if (examYear) query["examDate.year"] = parseInt(examYear);
      if (examMonth) query["examDate.month"] = parseInt(examMonth);

      const previousPapers = await PreviousPaperUpload.find(query).select("-files.fileData");

      const paperResults = previousPapers.map(paper => ({
        ...paper.toObject(),
        files: paper.files.map(file => ({
          ...file,
          filePath: `/uploaders/${file.fileName}`
        }))
      }));

      res.status(200).json(paperResults);
    } catch (err) {
      console.error("Error fetching previous papers:", err);
      res.status(500).json({ error: "Failed to fetch previous papers" });
    }
  },

};

module.exports = previousPaperController;

