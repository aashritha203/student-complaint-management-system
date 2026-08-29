const complaintService = require('../services/complaintService');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Update complaint
const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updated = await complaintService.updateComplaint(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get list of all complaints with filters/pagination
const getList = async (req, res) => {
  try {
    const { status, category, priority, search, page, limit } = req.query;
    const result = await complaintService.getAllComplaints(
      { status, category, priority, search },
      { page, limit }
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    
    // Status aggregation
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const statusMap = {
      submitted: 0,
      under_review: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };
    
    statusCounts.forEach((item) => {
      if (statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    // Category aggregation
    const categoryCounts = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const categoryMap = {};
    categoryCounts.forEach((item) => {
      categoryMap[item._id] = item.count;
    });

    // Pending vs Resolved metrics
    const pending = await Complaint.countDocuments({
      status: { $in: ['submitted', 'under_review', 'assigned', 'in_progress'] }
    });
    
    const resolved = await Complaint.countDocuments({
      status: 'resolved'
    });

    res.json({
      total,
      pending,
      resolved,
      status: statusMap,
      category: categoryMap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List all administration staff/admin users for assignment dropdowns
const getStaffList = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).select('name email department');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register staff/admin user by existing administrator
const registerStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const authService = require('../services/authService');
    const user = await authService.registerUser(req.body, true);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  update,
  getList,
  getStats,
  getStaffList,
  registerStaff,
};
