const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model (student)
    ref: 'User',
    required: true,
  },
  position: {
    type: String, // Job or internship title
    required: true,
  },
  company: {
    type: String, // Company name
    required: true,
  },
  applicationDate: {
    type: Date,
    default: Date.now, // Date of application
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Accepted', 'Rejected'], // Possible statuses
    default: 'Applied',
  },
  resumeLink: {
    type: String, // Optional link to the student's resume
  },
  coverLetter: {
    type: String, // Optional cover letter content
  },
});

// Create the Application model
const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
