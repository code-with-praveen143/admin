const nodemailer = require('nodemailer');
require('dotenv').config();

const { EMAIL, EMAIL_PASS } = process.env;

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Function to send OTP
const sendOTP = async (to, otp) => {
  // Ensure OTP is only numerical values
  const numericalOTP = otp.replace(/\D/g, '');

  const mailOptions = {
    from: EMAIL,
    to,
    subject: 'Your OTP for Login Verification',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; text-align: center; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background-color: #4CAF50; padding: 10px 0; border-radius: 10px 10px 0 0;">
          <img src="https://campusify-admin-app.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.05e941a0.png&w=3840&q=75" 
               alt="Campusify Logo" style="max-width: 150px; margin: 10px auto; display: block;" />
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #333; font-size: 24px;">Login Verification</h2>
          <p style="color: #555; font-size: 16px; margin: 10px 0;">Your OTP for login verification is:</p>
          <h1 style="color: #4CAF50; font-size: 40px; margin: 20px 0;">${numericalOTP}</h1>
          <p style="color: #777; font-size: 14px; margin: 10px 0;">This OTP will expire in 5 minutes.</p>
          <p style="color: #777; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; border-radius: 0 0 10px 10px;">
          <p style="color: #888; font-size: 12px;">&copy; 2024 Campusify. All rights reserved.</p>
        </div>
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
  const resetLink = "https://campusify-admin-app.vercel.app/reset-password?token=${resetToken}";

  const mailOptions = {
    from: EMAIL,
    to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; text-align: center; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background-color: #4CAF50; padding: 10px 0; border-radius: 10px 10px 0 0;">
          <img src="https://campusify-admin-app.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.05e941a0.png&w=3840&q=75" 
               alt="Campusify Logo" style="max-width: 150px; margin: 10px auto; display: block;" />
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #333; font-size: 24px;">Password Reset Request</h2>
          <p style="color: #555; font-size: 16px; margin: 10px 0;">You requested to reset your password. Click the button below to reset it:</p>
          <div style="margin: 20px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; 
                      color: white; 
                      padding: 10px 20px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #777; font-size: 14px; margin: 10px 0;">Or copy and paste this link into your browser:</p>
          <p style="color: #4CAF50; font-size: 14px; word-break: break-word;">${resetLink}</p>
          <p style="color: #777; font-size: 14px; margin: 10px 0;">This link will expire in 1 hour.</p>
          <p style="color: #777; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; border-radius: 0 0 10px 10px;">
          <p style="color: #888; font-size: 12px;">&copy; 2024 Campusify. All rights reserved.</p>
        </div>
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