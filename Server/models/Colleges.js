const mongoose = require("mongoose");

// Regulation Schema
const regulationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true, // e.g., "JNTUK" or "Autonomous"
  },
  regulation: {
    type: String,
    required: true, // e.g., "R20" or "Autonomous Reg 2023"
  },
  validYears: {
    type: [Number],
    required: true, // Array of valid years
  },
});

// Program Schema
const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "B.Tech" or "M.Tech"
  },
  specializations: {
    type: [String], // Array for specializations like CSE, ECE, EEE, CSM
    required: true,
  },
  years: {
    type: [Number],
    required: true, // Array of years, e.g., [1, 2, 3, 4]
  },
  regulations: {
    type: [regulationSchema], // Array of regulations for the program
    required: true,
  },
});

// College Details Schema
const collegeDetailsSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true, // Address of the college
  },
  contactNumber: {
    type: String,
    required: true, // Contact number for the college
  },
  email: {
    type: String,
    required: true, // Contact email for the college
  },
});

// College Schema
const collegeSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: true,
    unique: true, // College name
  },
  regulatoryBody: {
    type: String,
    required: true, // e.g., "JNTUK" or "Autonomous"
  },
  domain: {
    type: String,
    required: true, // e.g., "techuniversity.edu"
  },
  details: {
    type: collegeDetailsSchema, // Single set of college details
    required: true,
  },
  programs: {
    type: [programSchema], // Array of programs offered
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp for creation
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Timestamp for last update
  },
});

// Pre-save middleware to update `updatedAt` timestamp
collegeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the College model
const College = mongoose.model("College", collegeSchema);

module.exports = College;
