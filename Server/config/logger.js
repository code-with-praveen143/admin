// config/logger.js
const winston = require('winston');
const path = require('path');

// Create a logs directory if it doesn't exist
const fs = require('fs');
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log errors to a file
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Log all messages (including info level) to log.log
    new winston.transports.File({
      filename: path.join(logDirectory, 'log.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Log client's IP to ip.log
    new winston.transports.File({
      filename: path.join(logDirectory, 'ip.log'),
      level: 'info',
      format: winston.format.printf(({ timestamp, message }) => {
        return `${timestamp} - ${message}`;
      })
    }),
    // Also log to console
    new winston.transports.Console()
  ],
});

// Export the logger instance
module.exports = logger;
