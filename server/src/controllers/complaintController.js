const complaintService = require('../services/complaintService');
const { isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;

// Create a new complaint for logged in student
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If a file was uploaded but validation failed, clean it up from disk
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Staged file clean up error:', err.message);
      }
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let attachmentUrl = '';
    
    if (req.file) {
      if (isCloudinaryConfigured) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'student_complaints',
            resource_type: 'auto',
          });
          attachmentUrl = result.secure_url;
          // Delete local staged file after Cloudinary upload
          await fs.unlink(req.file.path);
        } catch (uploadError) {
          console.error('Cloudinary upload failed, falling back to local storage URL:', uploadError.message);
          attachmentUrl = `/uploads/${req.file.filename}`;
        }
      } else {
        // Fallback: file url is local route
        attachmentUrl = `/uploads/${req.file.filename}`;
      }
    }

    const complaint = await complaintService.createComplaint(req.user._id, {
      ...req.body,
      attachmentUrl,
    });
    
    res.status(201).json(complaint);
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {}
    }
    res.status(400).json({ message: error.message });
  }
};

// Get list of logged in student's complaints
const getStudentList = async (req, res) => {
  try {
    const list = await complaintService.getStudentComplaints(req.user._id);
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get complaint details
const getDetails = async (req, res) => {
  try {
    const details = await complaintService.getComplaintById(req.params.id, req.user);
    res.json(details);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add comment to complaint
const addCommentTo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const comment = await complaintService.addComment(req.params.id, req.user, req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  create,
  getStudentList,
  getDetails,
  addCommentTo,
};
