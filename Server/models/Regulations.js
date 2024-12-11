const mongoose = require("mongoose");

// Regulation Schema
const regulationSchema = new mongoose.Schema({
  regulation_category: {
    type: String,
    required: true,
    trim: true,
  },
  regulation_type: {
    type: String,
    required: true,
    trim: true,
  },
  year_validation: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear(),
  },
});

const Regulation = mongoose.model("Regulation", regulationSchema);

module.exports = Regulation;
