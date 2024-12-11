const otpGenerator = require('otp-generator');

const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,       // Include digits only
    upperCase: false,   // Do not include upper case letters
    lowerCase: false,   // Do not include lower case letters
    specialChars: false  // Do not include special characters
  });
};

module.exports = generateOTP;
