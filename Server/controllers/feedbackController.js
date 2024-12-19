const Feedback = require("../models/Feedback");

module.exports = {
  /**
   * @description Create new feedback
   */
  createFeedback: async (req, res) => {
    const { message, username, user_id } = req.body;

    try {
      if (!message || !username || !user_id) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const newFeedback = new Feedback({
        message,
        username,
        user_id,
      });

      const savedFeedback = await newFeedback.save();

      return res.status(201).json({
        message: "Feedback submitted successfully.",
        feedback: savedFeedback,
      });
    } catch (err) {
      console.error("Error creating feedback:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  /**
   * @description Get feedback by feedback ID
   */
  getFeedbackById: async (req, res) => {
    const { feedbackId } = req.params;

    try {
      const feedback = await Feedback.findById(feedbackId);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found." });
      }
      return res.status(200).json(feedback);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  /**
   * @description Get feedback by feedback ID
   */
  getFeedbacks: async (req, res) => {

    try {
      const feedbacks = await Feedback.find();
      if (!feedbacks) {
        return res.status(404).json({ message: "Feedbacks not found." });
      }
      return res.status(200).json(feedbacks);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  /**
   * @description Get feedback by user ID
   */
  getFeedbackByUserId: async (req, res) => {
    const { userId } = req.params;

    try {
      const feedbacks = await Feedback.find({ user_id: userId });
      return res.status(200).json(feedbacks);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  /**
   * @description Get feedback by username
   */
  getFeedbackByUsername: async (req, res) => {
    const { username } = req.params;

    try {
      const feedbacks = await Feedback.find({ username });
      return res.status(200).json(feedbacks);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
