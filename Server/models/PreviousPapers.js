const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileData: {
    type: Buffer,
    required: true,
  },
});

const PreviousPaperUploadSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  academicYear: {
    year: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    semester: {
      type: String,
      required: true,
      enum: ["1st Semester", "2nd Semester"],
    },
  },
  regulation: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  examDate: {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
  },
  files: [FileSchema],
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

PreviousPaperUploadSchema.index({ "academicYear.year": 1, "academicYear.semester": 1 });

const PreviousPaperUpload = mongoose.model("PreviousPaperUpload", PreviousPaperUploadSchema);
module.exports = PreviousPaperUpload;

