const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
  },
  time: {
    startDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:mm`,
      },
    },
    endDate: {
      type: Date,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:mm`,
      },
    },
  },
  modeOfEvent: {
    type: String,
    required: true,
    enum: ["online", "offline", "hybrid"],
    default: "offline",
  },
  thumbnail: {
    type: String,
    required: true,
  },
  eventSpeaker: {
    type: String,
    required: true,
  },
  
  registeredStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, {
  timestamps: true // Optional, but recommended to track creation and update times



}); 


eventSchema.pre('save', function(next) {
  if (!Array.isArray(this.registeredStudents)) {
    this.registeredStudents = [];
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
