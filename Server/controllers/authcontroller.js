const User = require("../models/User");
const College = require("../models/Colleges");
const generateOTP = require("../utils/otpGenerator");
const { sendOTP } = require("../services/emailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redisClient = require("../config/redis"); // Redis client
const generateReferralCode = require("../utils/referralGenerator");

exports.signup = async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    yearOfJoining,
    collegeName,
    program,
    specialization,
    regulation,
  } = req.body;

  try {
    // 1. Check if the username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Username already exists. Please choose another." });
    }

    // 2. Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Email already exists. Please use another email." });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate a unique referral code
    let referralCode;
    let isUnique = false;

    while (!isUnique) {
      referralCode = generateReferralCode();
      const existingReferral = await User.findOne({ referral_code: referralCode });
      if (!existingReferral) {
        isUnique = true;
      }
    }

    // 5. Determine if the user is a Student
    const isStudent = role === "Student";

    // 6. Create a new user
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
      referral_code: referralCode,
      isVerified: isStudent ? false : true, // Auto-verify non-Student roles
    });

    // 7. Handle OTP generation and email sending for Students
    if (isStudent) {
      const otp = generateOTP();
      console.log("Generated OTP:", otp); // Log for debugging

      // Store OTP with expiration in the database
      newUser.otp = [
        {
          code: otp.toString(),
          expiration: new Date(Date.now() + 5 * 60 * 1000), // Valid for 5 minutes
        },
      ];
      await newUser.save();

      // Send OTP via email
      await sendOTP(newUser.email, otp);
    }

    // 8. Return success response
    return res.status(200).json({
      message: isStudent
        ? "User registered successfully. OTP sent to email."
        : "User registered successfully.",
      referralCode: referralCode,
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ message: "Error registering user", error: error.message });
  }
};


exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "User is already verified." });
    }

    const otp = generateOTP();
    console.log("New OTP:", otp);

    // Store the new OTP
    user.otp = [
      {
        code: otp.toString(),
        expiration: new Date(Date.now() + 5 * 60 * 1000), // Valid for 5 minutes
      },
    ];
    await user.save();

    // Send the new OTP
    await sendOTP(user.email, otp);

    return res.status(200).json({
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res
      .status(500)
      .json({ message: "Error resending OTP.", error: error.message });
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
