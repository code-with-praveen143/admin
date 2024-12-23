const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // If participants are required
  year: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  regulation: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "system"], required: true }, // Role of sender
      content: { type: String, required: true }, // Message content
      subjectDetails: {
        year: String,
        semester: String,
        subject: String,
      },
    },
  ],
  relevantPdfs: [{ type: String }], // Array of file URLs as plain strings
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp for creation
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: "User",
    required: true, // Make this field required
  }
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
