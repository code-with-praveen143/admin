const multer = require('multer');

// Multer configuration
const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
};

// Create multer instance
const uploadPdf = multer(multerConfig).array('files', 10);

// Error messages mapping
const ERROR_MESSAGES = {
  LIMIT_FILE_SIZE: 'File size exceeds 10MB limit',
  LIMIT_FILE_COUNT: 'Too many files. Maximum 10 files allowed',
  LIMIT_UNEXPECTED_FILE: 'Invalid field name for files',
  NO_FILES_UPLOADED: 'Please upload at least one PDF file',
  INVALID_FILE_TYPE: 'Only PDF files are allowed'
};

// Wrapper middleware to handle multer errors
const uploadMiddleware = (req, res, next) => {
  uploadPdf(req, res, (err) => {
    try {
      // Handle Multer-specific errors
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          error: ERROR_MESSAGES[err.code] || 'File upload failed',
          code: err.code
        });
      }

      // Handle other errors
      if (err) {
        return res.status(400).json({
          error: err.message || 'File upload failed',
          code: 'UPLOAD_ERROR'
        });
      }

      // Validate file presence
      if (!req.files?.length) {
        return res.status(400).json({
          error: ERROR_MESSAGES.NO_FILES_UPLOADED,
          code: 'NO_FILES_UPLOADED'
        });
      }

      // Validate file types again (extra security)
      const invalidFiles = req.files.filter(
        file => file.mimetype !== 'application/pdf'
      );

      if (invalidFiles.length > 0) {
        return res.status(400).json({
          error: ERROR_MESSAGES.INVALID_FILE_TYPE,
          code: 'INVALID_FILE_TYPE',
          invalidFiles: invalidFiles.map(f => f.originalname)
        });
      }

      next();
    } catch (error) {
      console.error('Upload middleware error:', error);
      res.status(500).json({
        error: 'Internal server error during file upload',
        code: 'INTERNAL_ERROR'
      });
    }
  });
};

module.exports = uploadMiddleware;