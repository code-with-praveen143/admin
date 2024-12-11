const Event = require("../models/Events");

exports.createEvent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required"
      });
    }

    // Validate required fields
    const requiredFields = [
      'title', 'collegeName', 'street', 'city', 'state', 'zip',
      'startDate', 'startTime', 'endDate', 'endTime', 'eventSpeaker'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Parse dates and validate them
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date format. Please use YYYY-MM-DD format"
      });
    }

    if (isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date format. Please use YYYY-MM-DD format"
      });
    }

    // Create event object matching the schema structure
    const eventData = {
      title: req.body.title,
      collegeName: req.body.collegeName,
      address: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      },
      time: {
        startDate: startDate,
        startTime: req.body.startTime,
        endDate: endDate,
        endTime: req.body.endTime
      },
      modeOfEvent: req.body.modeOfEvent || 'offline', // Use default if not provided
      thumbnail: req.file.path,
      eventSpeaker: req.body.eventSpeaker
    };

    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      data: savedEvent
    });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(400).json({
      success: false,
      message: "Error creating event",
      error: err.message
    });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving events",
      error: error.message
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving event",
      error: error.message
    });
  }
};

exports.updateEventById = async (req, res) => {
  try {
    // Process dates only if they are provided
    let startDate, endDate;
    if (req.body.startDate) {
      startDate = new Date(req.body.startDate);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date format. Please use YYYY-MM-DD format"
        });
      }
    }
    if (req.body.endDate) {
      endDate = new Date(req.body.endDate);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date format. Please use YYYY-MM-DD format"
        });
      }
    }

    const updateData = {
      title: req.body.title,
      collegeName: req.body.collegeName,
      address: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      },
      time: {
        startDate: startDate || undefined,
        startTime: req.body.startTime,
        endDate: endDate || undefined,
        endTime: req.body.endTime
      },
      modeOfEvent: req.body.modeOfEvent,
      thumbnail: req.file ? req.file.path : undefined,
      eventSpeaker: req.body.eventSpeaker
    };

    // Remove undefined fields and empty objects
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      } else if (typeof updateData[key] === 'object') {
        const nestedObj = updateData[key];
        Object.keys(nestedObj).forEach(nestedKey => {
          if (nestedObj[nestedKey] === undefined) {
            delete nestedObj[nestedKey];
          }
        });
        // Remove empty objects
        if (Object.keys(nestedObj).length === 0) {
          delete updateData[key];
        }
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message
    });
  }
};

exports.deleteEventById = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: deletedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message
    });
  }
};