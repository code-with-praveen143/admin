const User = require("../models/User");
const College = require("../models/Colleges");
const generateOTP = require("../utils/otpGenerator");
const { sendOTP } = require("../services/emailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redisClient = require("../config/redis"); // Redis client

// User Signup
exports.signup = async (req, res) => {
  const { username, email, password, role, yearOfJoining,collegeName,program,specialization,regulation } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user is a student or an admin/uploader
    const isStudent = role === "Student";

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      yearOfJoining,
      collegeName,
      program,
      specialization,
      regulation,
      isVerified: isStudent? false : true, // Admins and uploaders are automatically verified
    });

    // Generate and send OTP only for students
    if (isStudent) {
      const otp = generateOTP();
      console.log("Generated OTP:", otp); // Add this log
     // Send OTP via email

      // Store OTP and its expiration time in the user model
      newUser.otp = [{
        code: otp.toString(),
        expiration: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      }];
      
      await newUser.save();
      await sendOTP(newUser.email, otp); 
    }

    return res.status(200).json({
      message: isStudent
        ? "User registered successfully, OTP sent to email"
        : "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Modified query to explicitly select OTP fields
    const user = await User.findOne({ email }).select('+otp.code +otp.expiration');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Found user with OTP data:", {
      email: user.email,
      otpEntries: user.otp
    });

    const otpEntry = user.otp.find(
      (entry) => entry.code === otp.toString() && entry.expiration > Date.now()
    );

    if (otpEntry) {
      user.isVerified = true;
      user.otp = []; // Clear OTPs after successful verification
      await user.save();
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      // Add more detailed error message
      return res.status(400).json({ 
        message: "Invalid or expired OTP",
        debug: {
          hasOTPEntries: user.otp.length > 0,
          currentTime: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ 
      message: "Error verifying OTP", 
      error: error.message 
    });
  }
};



exports.userDetails = async (req, res) => {
  const { firstName, lastName, phoneNo, email, selectedRegulation } = req.body;
  const userDomain = email.split("@")[1]; // Extract domain from email
  console.log("User Domain: " + userDomain);

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is a student or an admin/uploader
    const isStudent = user.role === "student";

    // Find college by domain
    const college = await College.findOne({ domain: userDomain });
    if (!college) {
      return res
        .status(400)
        .json({ message: "Domain not matching with any college." });
    }

    // Fetch only regulation names from the college model
    const regulations = college.programs.flatMap(
      (program) => program.regulations.map((reg) => reg.regulation) // Extract only regulation names
    );

    // Check if the selected regulation is valid
    if (!regulations.includes(selectedRegulation)) {
      return res
        .status(400)
        .json({ message: "Selected regulation is not valid." });
    }

    // Update user fields with provided details
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phoneNo;

    // Add the selected regulation to the user's regulations array
    user.regulations = selectedRegulation;

    // Verify the user for admins and uploaders
    if (!isStudent) {
      user.isVerified = true;
    }

    await user.save(); // Save updated user profile

    return res.status(200).json({
      regulations,
      message: "User details updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching regulations",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // console.log(req.body); // Log the request body to ensure both email and password are provided

    const user = await User.findOne({ email }).select("+password"); // Explicitly include password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log password and hash for debugging
    // console.log("Entered password:", password);
    // console.log("Stored hash password:", user.password);

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: "User not verified. Please verify the OTP sent to your email",
      });
    }

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    } 



    const payload = {
      id: user._id,
      role: user.role
    };
    // console.log('Token payload:', payload);

    // If verified and password is correct, generate a JWT token
    const token = jwt.sign(
      { email: user.email, role: user.role , id : user.id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
};
