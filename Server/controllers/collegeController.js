const College = require("../models/Colleges");

// Get all programs for a specific college
exports.getCollegePrograms = async (req, res) => {
  const { id } = req.params;

  try {
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }
    return res.status(200).json(college.programs);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching programs", error: error.message });
  }
};

// Add a new program to a college
exports.addProgram = async (req, res) => {
  const { id } = req.params;
  const programData = req.body;

  try {
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    college.programs.push(programData);
    await college.save();

    return res.status(200).json({
      message: "Program added successfully",
      program: programData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding program", error: error.message });
  }
};

// Search colleges based on various criteria
exports.searchColleges = async (req, res) => {
  const { regulatoryBody, program, specialization } = req.query;
  let query = {};

  if (regulatoryBody) {
    query.regulatoryBody = regulatoryBody;
  }

  if (program) {
    query["programs.name"] = program;
  }

  if (specialization) {
    query["programs.specializations"] = specialization;
  }

  try {
    const colleges = await College.find(query);
    return res.status(200).json(colleges);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error searching colleges", error: error.message });
  }
};

// Add a new regulation to a program
exports.addRegulation = async (req, res) => {
  const { id } = req.params;
  const { programName, regulation, jntuselectedregulation } = req.body; // Extract jntuselectedregulation

  try {
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    const program = college.programs.find((p) => p.name === programName);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // Add the jntuselectedregulation to the regulation
    regulation.jntuselectedregulation = jntuselectedregulation;

    program.regulations.push(regulation); // Push the complete regulation object
    await college.save();

    return res.status(200).json({
      message: "Regulation added successfully",
      regulation,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding regulation", error: error.message });
  }
};

// Create a new college
exports.createCollege = async (req, res) => {
  // Destructure the required fields from the request body
  const { collegeName, regulatoryBody, domain, details, programs } = req.body;

  // Check if required fields are missing
  if (!collegeName || !regulatoryBody || !domain || !details || !programs) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Create the new College document
    const newCollege = await College.create({
      collegeName,
      regulatoryBody,
      domain,
      details,
      programs,
    });

    // Return the response with the newly created college
    return res.status(201).json({
      message: "College created successfully",
      college: newCollege,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating college:", error);

    // Return a 500 error with the message
    return res.status(500).json({
      message: "Error creating college",
      error: error.message,
    });
  }
};

// Get all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await College.find();
    return res.status(200).json(colleges);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching colleges", error: error.message });
  }
};

// Get college by ID
exports.getCollegeById = async (req, res) => {
  const { id } = req.params;

  try {
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }
    return res.status(200).json(college);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching college", error: error.message });
  }
};

// Update college by ID
exports.updateCollegeById = async (req, res) => {
  const { id } = req.params;
  const { collegeName, regulatoryBody, domain, details, programs } = req.body;

  try {
    const updatedCollege = await College.findByIdAndUpdate(
      id,
      { collegeName, regulatoryBody, domain, details, programs },
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (!updatedCollege) {
      return res.status(404).json({ message: "College not found" });
    }

    return res.status(200).json({
      message: "College updated successfully",
      college: updatedCollege,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating college", error: error.message });
  }
};

// Delete college by ID
exports.deleteCollegeById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCollege = await College.findByIdAndDelete(id);
    if (!deletedCollege) {
      return res.status(404).json({ message: "College not found" });
    }
    return res.status(200).json({ message: "College deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting college", error: error.message });
  }
};
exports.getCollegeByCollegeName = async (req, res) => {
  const { collegeName } = req.params; // Extract collegeName from the request params

  try {
    const college = await College.findOne({ collegeName: collegeName });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }
    return res.status(200).json(college);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching college", error: error.message });
  }
};

// Update a college by collegeName
exports.updateCollegeByCollegeName = async (req, res) => {
  const { collegeName } = req.params; // Extract collegeName from the request params
  const { regulatoryBody, domain, details, programs } = req.body; // Extract fields to update

  try {
    const updatedCollege = await College.findOneAndUpdate(
      { collegeName: collegeName }, // Find college by collegeName
      { regulatoryBody, domain, details, programs }, // Fields to update
      { new: true, runValidators: true } // Return updated document and run validation
    );

    if (!updatedCollege) {
      return res.status(404).json({ message: "College not found" });
    }

    return res.status(200).json({
      message: "College updated successfully",
      college: updatedCollege,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating college", error: error.message });
  }
};

// Delete a college by collegeName
exports.deleteCollegeByCollegeName = async (req, res) => {
  const { collegeName } = req.params; // Extract collegeName from the request params

  try {
    const deletedCollege = await College.findOneAndDelete({
      collegeName: collegeName,
    });
    if (!deletedCollege) {
      return res.status(404).json({ message: "College not found" });
    }
    return res.status(200).json({ message: "College deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting college", error: error.message });
  }
};
