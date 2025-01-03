const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileData: {
    type: String, // Base64 encoded
    required: true,
  },
});

const PdfUploadSchema = mongoose.Schema({
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
      type: [String],
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
  units: {
    type: [String],
    required: true,
    enum: ["1st unit", "2nd unit", "3rd unit", "4th unit", "5th unit", "6th unit"],
  },
  files: [FileSchema], // Array of files
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

// Virtual getter to combine year and semester for backwards compatibility
PdfUploadSchema.virtual("year").get(function () {
  return `${this.academicYear.year} ${this.academicYear.semester}`;
});

// Create index for efficient querying
PdfUploadSchema.index({ "academicYear.year": 1, "academicYear.semester": 1 });

const PdfUpload = mongoose.model("PdfUpload", PdfUploadSchema);
module.exports = PdfUpload;
