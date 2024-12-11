const Regulation = require("../models/Regulations"); // Import the Regulation model

// Get all regulations
exports.getAllRegulations = async (req, res) => {
  try {
    const regulations = await Regulation.find(); // Fetch all regulations from the database
    res.status(200).json(regulations); // Respond with the regulations in JSON format
  } catch (error) {
    res.status(500).json({ message: "Error fetching regulations", error });
  }
};

// Get regulation by ID
exports.getRegulationById = async (req, res) => {
  const { id } = req.params;

  try {
    const regulation = await Regulation.findById(id); // Fetch by ID
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }
    res.status(200).json(regulation); // Respond with the regulation
  } catch (error) {
    res.status(500).json({ message: "Error fetching regulation", error });
  }
};

exports.getRegulationsByCategory = async (req, res) => {
  const { category } = req.params; // Extract the category from the request parameters

  try {
    // Find regulations that match the given category
    const regulations = await Regulation.find({
      regulation_category: category,
    });

    // Check if any regulations are found
    if (regulations.length === 0) {
      return res
        .status(404)
        .json({ message: "No regulations found for this category" });
    }

    res.status(200).json(regulations); // Respond with the regulations found
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching regulations by category", error });
  }
};

// Create a new regulation
exports.createRegulation = async (req, res) => {
  const { regulation_category, regulation_type, year_validation } = req.body;

  try {
    const newRegulation = new Regulation({
      regulation_category,
      regulation_type,
      year_validation,
    });

    await newRegulation.save(); // Save the new regulation to the database
    res.status(201).json(newRegulation); // Respond with the newly created regulation
  } catch (error) {
    res.status(500).json({ message: "Error creating regulation", error });
  }
};

// Update regulation by ID
exports.updateRegulationById = async (req, res) => {
  try {
    const regulation = await Regulation.findByIdAndUpdate(
      req.params.id, // Use the ID from the URL
      req.body, // Update with the request body
      { new: true } // Return the updated document
    );

    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    res.status(200).json(regulation); // Respond with the updated regulation
  } catch (error) {
    res.status(500).json({ message: "Error updating regulation", error });
  }
};

// Delete regulation by ID
exports.deleteRegulationById = async (req, res) => {
  try {
    const regulation = await Regulation.findByIdAndDelete(req.params.id); // Delete by ID

    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    res.status(200).json({ message: "Regulation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting regulation", error });
  }
};
