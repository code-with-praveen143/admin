const User = require("../models/User");
const { ObjectId } = require("mongoose").Types;
const PdfUpload = require("../models/PdfUpload");

exports.getUsers = async (req, res) => {
  try {
    // Fetch users whose role is 'Admin' or 'Uploader'
    const users = await User.find({ role: { $in: ["Admin", "Uploader","Student"] } });
    // Check if any users are found
    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: "No Admin or Uploader users found" });
    }

    // Return the list of users
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    // Detailed error response
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
}; 


exports.getCurrentUser = async (req, res) => {
  try {
    // Get user ID from the decoded token (set by auth middleware)
    const userId = req.user.id;
    console.log(userId)

    // Find user by ID
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return the user
    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        isSuperAdmin: req.user.isSuperAdmin,
        isAdmin: req.user.isAdmin,
        isStudent: req.user.isStudent
      }
    });

  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message
    });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Debug logs
    console.log("Update request details:", {
      userId: id,
      requestBody: req.body,
      currentUserRole: req.user?.role,
    });

    // Validate if id exists
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing in the request parameters",
      });
    }

    // Find user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { username, email, role } = req.body;

    // Update username
    if (username) {
      user.username = username;
    }

    // Update email
    if (email) {
      user.email = email;
    }

    // Role update logic
    if (role) {
      if (req.user?.role !== "Admin" && req.user?.role !== "SuperAdmin") {
        return res.status(403).json({
          success: false,
          message: "Only Admin and SuperAdmin can update roles",
          currentUserRole: req.user?.role,
        });
      }

      // Additional role update restrictions
      if (req.user.role === "Admin" && role === "SuperAdmin") {
        return res.status(403).json({
          success: false,
          message: "Admin cannot promote users to SuperAdmin",
        });
      }

      console.log("Updating role from", user.role, "to", role);
      user.role = role;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

exports.getUserRegulation = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the user ID
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Fetch the user by ID
    const user = await User.findById(id).populate("regulation"); // Assuming `regulation` is a reference in the User model
    const regulation = user.regulation
    const pdfs = await PdfUpload.find({ regulation });

    const pdfResults = pdfs.map((pdf) => ({
      id: pdf.id,
      year: pdf.academicYear.year,
      semester: pdf.academicYear.semester,
      regulation: pdf.regulation,
      subject: pdf.subject,
      units: pdf.units,
    }));

    res.status(200).json({
      pdfs: pdfResults
    });
  } catch (error) {
    console.error("Error fetching user regulation:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user regulation",
      error: error.message,
    });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Debug logs
    console.log("Delete request details:", {
      targetUserId: id,
      requestingUserId: req.user?.id,
      requestingUserRole: req.user?.role,
      isSuperAdmin: req.user?.isSuperAdmin,
    });

    // Basic validation
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Find target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent self-deletion
    if (req.user?.id === id) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Super Admin checks
    if (targetUser.role === "SuperAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin account cannot be deleted",
      });
    }

    // Permission checks
    if (req.user?.role === "SuperAdmin") {
      // Super Admin can delete anyone except themselves and other Super Admin
      await User.findByIdAndDelete(id);
    } else if (req.user?.role === "Admin") {
      // Admin can only delete Students and Uploaders
      if (targetUser.role === "Admin" || targetUser.role === "SuperAdmin") {
        return res.status(403).json({
          success: false,
          message: "Admin users can only delete Students and Uploaders",
        });
      }
      await User.findByIdAndDelete(id);
    } else {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to delete users",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: targetUser.id,
        username: targetUser.username,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  } 
};
