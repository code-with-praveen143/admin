const nodemailer = require('nodemailer');
require('dotenv').config();

const { EMAIL, PASSWORD } = process.env;

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'manohar@symfor.com',
    pass: 'ythe grkf fyxz vvna',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Function to send OTP
const sendOTP = async (to, otp) => {
  const mailOptions = {
    from: EMAIL,
    to,
    subject: 'Your OTP for Login Verification',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Login Verification</h2>
        <p>Your OTP for login verification is:</p>
        <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Function to send reset password email
const sendResetPasswordEmail = async (to, resetToken) => {
  // You can replace this with your frontend URL
  const resetLink = `https://campusify-admin-app.vercel.app/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: EMAIL,
    to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="margin: 20px 0;">
          <a href="${resetLink}" 
             style="background-color: #4CAF50; 
                    color: white; 
                    padding: 10px 20px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent successfully');
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw error;
  }
};

module.exports = { sendOTP, sendResetPasswordEmail };