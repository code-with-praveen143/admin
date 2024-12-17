const express = require("express");
const router = express.Router();
const authController = require("../controllers/authcontroller");
const resetPasswordController = require("../controllers/resetPasswordController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes for user signup and login
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth]
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *               - yearOfJoining
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: User's email address (must be a college domain email)
 *                 example: johndoe@symfor.com
 *               password:
 *                 type: string
 *                 description: User's password (min 8 characters)
 *                 example: Password123
 *               role:
 *                 type: string
 *                 description: Role of the user (student or admin)
 *                 example: student
 *               yearOfJoining:
 *                 type: integer
 *                 description: The year the user joined the college
 *                 example: 2021
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 userId:
 *                   type: string
 *                   description: The ID of the newly registered user
 *                   example: 60c72b1f4f1a4e39d8a9357e
 *       400:
 *         description: Invalid input (email must be a college domain email or other validation error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email must be a college domain email
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error registering user
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.post("/signup", authController.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Login an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: johndoe@symfor.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
 *       400:
 *         description: Bad request (e.g., user not verified or wrong credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials or user not verified
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error logging in
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.post("/login", authController.login);


/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to user's email
 *     description: This endpoint allows users to request a new OTP if their previous OTP expired.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A new OTP has been sent to your email.
 *       400:
 *         description: User already verified or invalid email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User is already verified.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error resending OTP.
 */
router.post("/resend-otp", authController.resendOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     description: Verify the OTP sent to the user's email or phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: johndoe@symfor.com
 *               otp:
 *                 type: string
 *                 description: One-Time Password sent to the user's email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error verifying OTP
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.post("/verify-otp", authController.verifyOTP);

/**
 * @swagger
 * /api/auth/user-details:
 *   post:
 *     summary: Update user details and fetch college regulations
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNo
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: "Sam"
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: "Kaleti"
 *               phoneNo:
 *                 type: string
 *                 description: User's phone number
 *                 example: "9951252653"
 *     responses:
 *       200:
 *         description: User details updated successfully, and regulations fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 regulations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of college regulations based on user's email domain
 *                   example: ["Regulation A", "Regulation B"]
 *                 message:
 *                   type: string
 *                   example: "User details updated successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Error fetching regulations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching regulations"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.post("/user-details", authController.userDetails);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     description: Sends an email with a password reset link to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address to send the password reset link.
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: A password reset link has been sent to the user's email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset link sent to email.
 *       400:
 *         description: Invalid email format or email not registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email format or user not registered.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error sending password reset email.
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */

router.post("/reset-password", resetPasswordController.resetPassword);

/**
 * @swagger
 * /api/auth/confirm-reset-password:
 *   post:
 *     summary: Confirm password reset
 *     tags: [Auth]
 *     description: Confirms the new password after the user has received the reset link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token sent to the user's email for password reset.
 *                 example: "abcdef123456"
 *               newPassword:
 *                 type: string
 *                 description: The new password the user wants to set.
 *                 example: "NewPassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully.
 *       400:
 *         description: Invalid token or weak password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid token or password does not meet security requirements.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating password.
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
// Route to confirm password reset
router.post(
  "/confirm-reset-password",
  resetPasswordController.confirmResetPassword
);





module.exports = router;
