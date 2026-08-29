const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Create a new complaint
const createComplaint = async (studentId, complaintData) => {
  const { title, description, category, location, attachmentUrl } = complaintData;

  const complaint = await Complaint.create({
    studentId,
    title,
    description,
    category,
    location,
    attachmentUrl: attachmentUrl || '',
  });

  return complaint;
};

// Retrieve complaints for a specific student
const getStudentComplaints = async (studentId) => {
  return await Complaint.find({ studentId }).sort({ createdAt: -1 });
};

// Get details of a single complaint
const getComplaintById = async (complaintId, user) => {
  const complaint = await Complaint.findById(complaintId)
    .populate('studentId', 'name email role')
    .populate('assignedTo', 'name email role department');

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  // Security: check if student owns this complaint
  if (user.role === 'student' && complaint.studentId._id.toString() !== user._id.toString()) {
    throw new Error('Access denied. You are not authorized to view this complaint.');
  }

  // Fetch comments
  const commentsQuery = { complaintId };
  
  // Filter out internal comments for students
  if (user.role === 'student') {
    commentsQuery.isInternal = false;
  }

  const comments = await Comment.find(commentsQuery)
    .populate('userId', 'name role email department')
    .sort({ createdAt: 1 });

  return {
    complaint,
    comments,
  };
};

// Get all complaints with filtering, sorting, pagination (Admin/Staff only)
const getAllComplaints = async (filters, pagination) => {
  const { status, category, priority, search } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const total = await Complaint.countDocuments(query);
  const complaints = await Complaint.find(query)
    .populate('studentId', 'name email')
    .populate('assignedTo', 'name email department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    complaints,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

// Update complaint status/priority/assignment/resolution details
const updateComplaint = async (complaintId, updates) => {
  const { status, priority, assignedTo, resolutionDetails } = updates;
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  // If status is resolving, validate resolution details
  if (status === 'resolved' && !resolutionDetails) {
    throw new Error('Resolution details description is required to mark the complaint as resolved.');
  }

  if (status) complaint.status = status;
  if (priority) complaint.priority = priority;
  
  if (assignedTo !== undefined) {
    // If assignedTo is blank or null, set it to null
    complaint.assignedTo = assignedTo ? assignedTo : null;
    // If assigned To a user, automatically set status to 'assigned' if it was 'submitted' or 'under_review'
    if (assignedTo && (complaint.status === 'submitted' || complaint.status === 'under_review')) {
      complaint.status = 'assigned';
    }
  }

  if (resolutionDetails !== undefined) {
    complaint.resolutionDetails = resolutionDetails;
  }

  await complaint.save();

  return await Complaint.findById(complaintId)
    .populate('studentId', 'name email')
    .populate('assignedTo', 'name email department');
};

// Add comment to a complaint
const addComment = async (complaintId, user, commentData) => {
  const { message, isInternal } = commentData;
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  // Validate student/outsider bounds
  if (user.role === 'student') {
    // Student owns this?
    if (complaint.studentId.toString() !== user._id.toString()) {
      throw new Error('Not authorized to comment on this complaint');
    }
    // Student can never post internal comments
    if (isInternal === true) {
      throw new Error('Students are not authorized to create internal admin notes.');
    }
  }

  const comment = await Comment.create({
    complaintId,
    userId: user._id,
    message,
    isInternal: user.role === 'student' ? false : (isInternal || false),
  });

  return await Comment.findById(comment._id).populate('userId', 'name role email');
};

module.exports = {
  createComplaint,
  getStudentComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaint,
  addComment,
};
