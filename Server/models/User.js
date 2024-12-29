const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
      referral_code: {
      type: String,
      unique: true, // Ensure the referral code is unique
    },
    collegeName: {
      type: String,
      required: function () {
        return this.role === "Student";
      },
    },
    program: {
      type: String,
      required: function () {
        return this.role === "Student";
      },
    },
    specialization: {
      type: String,
      required: function () {
        return this.role === "Student";
      },
    },
    regulation: {
      type: String,
      required: function () {
        return this.role === "Student";
      },
    },
    role: {
      type: String,
      enum: ["Student", "Admin", "Uploader", "SuperAdmin"],
      required: true,
    },
    yearOfJoining: {
      type: Number,
      required: function () {
        return this.role === "Student";
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: [
      {
        code: { type: String, select: false },
        expiration: { type: Date, select: false },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Model
const User = mongoose.model("User", userSchema);
module.exports = User;
