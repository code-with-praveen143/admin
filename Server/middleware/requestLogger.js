// middleware/requestLogger.js
const expressWinston = require('express-winston');
const logger = require('../config/logger'); // Import your configured logger
const winston = require('winston'); // Import winston to access format directly

// Middleware to log requests
const requestLogger = expressWinston.logger({
  transports: [
    logger.transports[1] // Use the log.log transport for logging requests
  ],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, meta }) => {
      return `${timestamp} [${level}]: ${message} - ${meta.method} ${meta.url}`;
    })
  ),
  meta: true, // Include request meta data
  msg: 'HTTP {{req.method}} {{req.url}}', // Log message
});

// Middleware to log the client's IP address
const ipLogger = (req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  logger.info(`Client IP: ${clientIp}`);
  next();
};

// Export the middleware
module.exports = { requestLogger, ipLogger };
