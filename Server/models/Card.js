const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  allowAll: {
    type: Boolean,
    default: false, // Indicates if the card is visible to all colleges
  },
  specificCollege: {
    type: String, // Domain of the specific college that can see this card
    default: null, // If this is null, it means no specific college is allowed
  },
  excludeCollege: {
    type: String, // Domain of the specific college to exclude
    default: null, // If this is null, no college is excluded
  },
  order: {
    type: Number, // Order of the card for display
    required: true, // Make this field required
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Card model
const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
