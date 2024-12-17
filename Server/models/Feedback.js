const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      ref: "User", // References the User model
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
