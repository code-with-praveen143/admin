const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    fileName: {
        type: String,
        required: true,
        trim: true // Ensures no leading or trailing spaces
    },
    description: {
        type: String,
        default: ''
    }
}, { _id: false }); // Disable automatic ID for PDFs since they are sub-documents

const unitSchema = new mongoose.Schema({
    unitNumber: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5, 6] // Restrict to unit numbers 1 through 6
    },
    pdfs: {
        type: [pdfSchema],
        default: []
    }
}, { _id: false }); // Disable automatic ID for units

const subjectSchema = new mongoose.Schema({
    uniqueId: {
        type: String,
        required: true,
        unique: true, // Ensures that each subject has a unique ID
        trim: true
    },
    year: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4] // Restrict to years 1, 2, 3, or 4
    },
    semester: {
        type: Number,
        required: true,
        enum: [1, 2] // Restrict to semesters 1 or 2
    },
    subjectName: {
        type: String,
        required: true,
        trim: true
    },
    units: {
        type: [unitSchema],
        default: []
    }
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;