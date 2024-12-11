// controllers/notificationController.js
const Notification = require("../models/Notification");

// Create Notification
exports.createNotification = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const notification = new Notification({ title, description });
    await notification.save();

    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Notifications
exports.getNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };


// Delete Notification
exports.deleteNotification = async (req, res) => {
    try {
      const { id } = req.params;
  
      const notification = await Notification.findByIdAndDelete(id);
  
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
  
      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
