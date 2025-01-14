const PdfUpload = require("../models/PdfUpload");
const multer = require("multer");
const fs = require("fs"); // Add this import at the top of your controller file
const path = require("path");

const pdfController = {
  // Create multiple PDFs
  createPdfs: async (req, res) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ error: "Please upload at least one PDF file" });
      }
  
      const metadata = JSON.parse(req.body.metadata);
      const { academicYear: { year, semester }, regulation, course, subject, units } = metadata;
      const newUnits = Array.isArray(units) ? units.join(", ") : units;
  
      const uploadDir = path.join(__dirname, "../uploads");
      
      // Use callback style for mkdir
      fs.mkdir(uploadDir, { recursive: true }, async (err) => {
        if (err) {
          console.error("Error creating directory:", err);
          return res.status(500).json({ error: "Failed to create upload directory" });
        }
  
        try {
          const id = Date.now();
          const files = [];
  
          for (const file of req.files) {
            const filePath = path.join(uploadDir, file.originalname);
            await fs.promises.writeFile(filePath, file.buffer);
            files.push({
              fileName: file.originalname,
              fileData: file.buffer
            });
          }
  
          const newPdf = new PdfUpload({
            id,
            academicYear: { year, semester },
            regulation,
            course,
            subject,
            units: newUnits,
            files
          });
  
          await newPdf.save();
  
          res.status(201).json({
            message: "PDFs uploaded successfully",
            pdf: {
              id: newPdf.id,
              academicYear: newPdf.academicYear,
              regulation: newPdf.regulation,
              course: newPdf.course,
              subject: newPdf.subject,
              units: newPdf.units,
              fileNames: newPdf.files.map(f => f.fileName),
              uploadDate: newPdf.uploadDate
            }
          });
        } catch (innerErr) {
          console.error("Error processing files:", innerErr);
          res.status(500).json({ error: "Failed to process files" });
        }
      });
    } catch (err) {
      console.error("Error uploading PDFs:", err);
      res.status(500).json({ error: "Failed to upload PDFs" });
    }
  },
  
  // Get all PDFs
  getAllPdfs: async (req, res) => {
    try {
      const { year, semester, subject, units } = req.query;
      let query = {};

      // Build the query based on request parameters
      if (year) query["academicYear.year"] = year;
      if (semester) query["academicYear.semester"] = { $in: [semester] };
      if (subject) query.subject = subject;
      if (units) query.units = units;

      console.log("Query:", query);

      // Fetch PDFs from the database
      const pdfs = await PdfUpload.find(query);
      if (!pdfs || pdfs.length === 0) {
        return res
          .status(404)
          .json({ error: "No PDFs found matching the criteria" });
      }

      // Base URL for file access (adjust to match your server URL and port)
      const baseUrl = "http://localhost:5001/uploads";

      // Map results and add file URLs
      const pdfResults = pdfs.map((pdf) => ({
        id: pdf.id,
        academicYear: pdf.academicYear,
        regulation: pdf.regulation,
        course: pdf.course,
        subject: pdf.subject,
        units: pdf.units,
        files: pdf.files.map((file) => ({
          fileName: file.fileName,
          fileUrl: `${baseUrl}/${file.fileName}`, // URL to access the file
        })),
      }));

      res.status(200).json(pdfResults);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      res.status(500).json({ error: "Failed to fetch PDFs" });
    }
  },

  // Download PDF file by ID and file name
  downloadPdf: async (req, res) => {
    try {
      const { id, fileName } = req.params;

      // Fetch the PDF metadata from the database
      const pdf = await PdfUpload.findOne({ id: parseInt(id) });

      if (!pdf) {
        return res.status(404).json({ error: "PDF document not found" });
      }

      // Verify if the requested file exists in the document's file list
      const file = pdf.files.find((file) => file.fileName === fileName);

      if (!file) {
        return res
          .status(404)
          .json({ error: "File not found in PDF document" });
      }

      // Build the file path
      const filePath = path.resolve(__dirname, "../uploads", fileName);

      // Check if the file exists in the uploads folder
      if (!fs.existsSync(filePath)) {
        return res
          .status(404)
          .json({ error: "File does not exist on the server" });
      }

      // Serve the file as a downloadable response
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          return res.status(500).json({ error: "Failed to download file" });
        }
      });
    } catch (err) {
      console.error("Error downloading PDF:", err);
      return res.status(500).json({ error: "Failed to download PDF" });
    }
  },

  // Update PDF document and its files
  updatePdfById: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        "academicYear.year": year,
        "academicYear.semester": semester,
        regulation,
        course,
        subject,
        units,
      } = req.body;

      // Validate the units field to match the predefined enum values
      const validUnits = [
        "1st Unit",
        "2nd Unit",
        "3rd Unit",
        "4th Unit",
        "5th Unit",
        "6th Unit"
      ];
      if (units && !validUnits.includes(units)) {
        return res.status(400).json({
          error: `'${units}' is not a valid unit. Please choose one of the following: ${validUnits.join(
            ", "
          )}`,
        });
      }

      const updateData = {};

      if (year !== undefined) {
        updateData["academicYear.year"] = year;
      }
      if (semester !== undefined) {
        updateData["academicYear.semester"] = semester;
      }
      if (regulation !== undefined) {
        updateData.regulation = regulation;
      }
      if (course !== undefined) {
        updateData.course = course;
      }
      if (subject !== undefined) {
        updateData.subject = subject;
      }
      if (units !== undefined) {
        updateData.units = units; // Only set if units are provided and valid
      }

      // Fetch the existing PDF document before making changes
      const existingPdf = await PdfUpload.findOne({ id }).select("files");

      if (!existingPdf) {
        return res.status(404).json({ error: "PDF document not found" });
      }

      // Handle file updates if files are provided
      if (req.files && req.files.length > 0) {
        // Validate all files are PDFs
        const invalidFiles = req.files.filter(
          (file) => file.mimetype !== "application/pdf"
        );
        if (invalidFiles.length > 0) {
          return res.status(400).json({
            error: "Only PDF files are allowed",
            invalidFiles: invalidFiles.map((f) => f.originalname),
          });
        }

        // Prepare new files array (if new files are uploaded)
        updateData.files = req.files.map((file) => ({
          fileName: file.originalname,
          fileData: file.buffer,
        }));
      } else {
        // If no new files are uploaded, keep the existing files
        updateData.files = existingPdf.files; // Keep existing files unchanged
      }

      console.log("Updating PDF with id: ", id, JSON.stringify(updateData));

      // Perform the update
      const updatedPdf = await PdfUpload.findOneAndUpdate({ id }, updateData, {
        new: true,
      }).select("-files.fileData"); // Exclude fileData from the response

      res.status(200).json({
        message: "PDF document updated successfully",
        pdf: updatedPdf, // Return the updated PDF with existing or new files
      });
    } catch (err) {
      console.error("Error updating PDF document:", err);
      res.status(500).json({ error: "Failed to update PDF document" });
    }
  },

  // Delete PDF document and associated uploaded files
  deletePdfById: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the PDF document in the database
      const deletedPdf = await PdfUpload.findOneAndDelete({ id: parseInt(id) });

      if (!deletedPdf) {
        return res.status(404).json({ error: "PDF document not found" });
      }

      // Delete each file from the file system
      const uploadDir = path.join(__dirname, "../uploads");

      for (const file of deletedPdf.files) {
        const filePath = path.join(
          uploadDir,
          `${deletedPdf.id}_${file.fileName}`
        );

        try {
          await fs.unlink(filePath); // Remove the file from the file system
          console.log(`Deleted file: ${filePath}`);
        } catch (err) {
          console.error(`Error deleting file: ${filePath}`, err);
        }
      }

      res.status(200).json({
        message: "PDF document and associated files deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting PDF document:", err);
      res.status(500).json({ error: "Failed to delete PDF document" });
    }
  },

  // Download specific PDF file
  // downloadPdf: async (req, res) => {
  //   try {
  //     const { id, fileIndex } = req.params;
  //     const pdf = await PdfUpload.findOne({ id: parseInt(id) });

  //     if (!pdf) {
  //       return res.status(404).json({ error: "PDF document not found" });
  //     }

  //     if (!pdf.files[fileIndex]) {
  //       return res.status(404).json({ error: "PDF file not found" });
  //     }

  //     const file = pdf.files[fileIndex];

  //     res.set({
  //       "Content-Type": "application/pdf",
  //       "Content-Disposition": `attachment; filename="${file.fileName}"`,
  //     });

  //     res.send(file.fileData);
  //   } catch (err) {
  //     console.error("Error downloading PDF:", err);
  //     res.status(500).json({ error: "Failed to download PDF" });
  //   }
  // },

  // Download all PDFs as ZIP
  downloadAllPdfs: async (req, res) => {
    try {
      const { id } = req.params;
      const pdf = await PdfUpload.findOne({ id: parseInt(id) });

      if (!pdf) {
        return res.status(404).json({ error: "PDF document not found" });
      }

      // Send files as separate downloads for now
      // In a real implementation, you would want to zip the files
      // using a library like 'archiver' and send the zip file
      const fileResponses = pdf.files.map((file) => ({
        fileName: file.fileName,
        contentType: "application/pdf",
        data: file.fileData,
      }));

      res.status(200).json({
        message: "Files ready for download",
        files: fileResponses.map((f) => ({
          fileName: f.fileName,
          size: f.data.length,
        })),
      });
    } catch (err) {
      console.error("Error preparing PDFs for download:", err);
      res.status(500).json({ error: "Failed to prepare PDFs for download" });
    }
  },

  uploadPdf: async (req, res) => {
    try {
      // Check if files are available
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Process each file (e.g., save to database, cloud storage, etc.)
      const uploadedFiles = req.files.map((file) => ({
        originalName: file.originalname,
        size: file.size,
        buffer: file.buffer, // This is only available in memory storage
      }));

      // Simulate saving file data to a database (adjust based on your storage setup)
      // For example, if using cloud storage, replace this with appropriate API calls

      res.status(201).json({
        message: "Files uploaded successfully",
        files: uploadedFiles.map((file) => ({
          name: file.originalName,
          size: file.size,
        })),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "File upload failed", error: error.message });
    }
  },

  fetchPdfBuffer: async (filePath) => {
    try {
      const absolutePath = path.join(__dirname, "..", filePath);
      const buffer = await fs.readFile(absolutePath);
      return buffer;
    } catch (err) {
      console.error("Error fetching PDF buffer:", err.message);
      return null;
    }
  },

  getPdfsByRegulation: async (req, res) => {
    try {
      const { regulation } = req.query;

      if (!regulation) {
        return res.status(400).json({
          error: "Regulation parameter is required",
        });
      }

      // Find PDFs matching the provided regulation
      const pdfs = await PdfUpload.find({ regulation });

      if (!pdfs || pdfs.length === 0) {
        return res.status(404).json({
          error: "No PDFs found for the provided regulation",
        });
      }

      // Base URL for file access
      const baseUrl = "http://localhost:5001/uploads";

      // Format the response
      const pdfResults = pdfs.map((pdf) => ({
        id: pdf.id,
        academicYear: pdf.academicYear,
        regulation: pdf.regulation,
        subject: pdf.subject,
      }));

      res.status(200).json({
        success: true,
        pdfs: pdfResults,
      });
    } catch (err) {
      console.error("Error fetching PDFs by regulation:", err);
      res.status(500).json({
        error: "Failed to fetch PDFs by regulation",
        details: err.message,
      });
    }
  },
};

module.exports = pdfController;
