const User = require("../models/User");
const Event = require("../models/Events");

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "Student" });
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    // Check if student exists and if the role is "Student"
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.role !== "Student") {
      return res.status(403).json({ message: "User is not a student" });
    }

    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching student by ID",
      error: error.message,
    });
  }
};

// Get multiple students by IDs
exports.getStudentsByIds = async (req, res) => {
  const { ids } = req.body; // Expecting an array of IDs in the request body

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: "IDs should be an array" });
  }

  try {
    const students = await User.find({ _id: { $in: ids }, role: "Student" });
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching students by IDs",
      error: error.message,
    });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    // Check if student exists and if the role is "Student"
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.role !== "Student") {
      return res.status(403).json({ message: "User is not a student" });
    }

    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching student by ID",
      error: error.message,
    });
  }
};

// Register student for an event
// exports.registerStudentForEvent = async (req, res) => {
//   const { userId, eventId } = req.body;

//   try {
//     // Find the student and event using lean() to get plain objects
//     // This avoids validation when we're just reading the data
//     const student = await User.findById(userId).lean();
//     const event = await Event.findById(eventId).lean();

//     // Check if the student or event does not exist
//     if (!student || !event) {
//       return res.status(404).json({ message: "Student or Event not found" });
//     }

//     // Check if the student is already registered
//     if (event.registeredStudents?.includes(userId)) {
//       return res
//         .status(400)
//         .json({ message: "Student already registered for this event" });
//     }

//     // Update both documents using updateOne to avoid validation
//     await User.updateOne(
//       { _id: userId },
//       { $addToSet: { eventsRegistered: eventId } }
//     );

//     await Event.updateOne(
//       { _id: eventId },
//       { $addToSet: { registeredStudents: userId } }
//     );

//     return res
//       .status(200)
//       .json({ message: "Student successfully registered for the event" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Error registering student for event",
//       error: error.message,
//     });
//   }
// };

exports.registerStudentForEvent = async (req, res) => {
  const { userId, eventId } = req.body;

  try {
    // Find the student and event with full population
    const student = await User.findById(userId);
    const event = await Event.findById(eventId);

    // Check if the student or event exists
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found"
      });
    }

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found"
      });
    }

    // Ensure arrays exist
    if (!Array.isArray(event.registeredStudents)) {
      event.registeredStudents = [];
    }
    if (!Array.isArray(student.eventsRegistered)) {
      student.eventsRegistered = [];
    }

    // Check if student is already registered
    const isAlreadyRegistered = event.registeredStudents.some(
      id => id.toString() === userId.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ 
        success: false,
        message: `You are already registered for ${event.title}. Each student can only register once.`,
      });
    }

    // Register the student
    event.registeredStudents.push(userId);
    student.eventsRegistered.push(eventId);

    // Save both documents
    await Promise.all([
      event.save(),
      student.save()
    ]);

    return res.status(200).json({
      success: true,
      message: `Successfully registered for ${event.title}`,
      event: {
        id: event._id,
        title: event.title,
        startDate: event.time.startDate,
        startTime: event.time.startTime
      },
      student: {
        id: student._id,
        username: student.username,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: "Error registering student for event",
      error: error.message
    });
  }
};