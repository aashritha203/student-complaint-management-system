const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a brief title for the complaint'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide details of the complaint'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Infrastructure', 'Hostel', 'Wi-Fi', 'Academics', 'Cleanliness', 'Transportation', 'Other'],
    },
    location: {
      type: String,
      required: [true, 'Please specify the location (e.g., Room 102, Block A, Hostel Mess)'],
      trim: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'submitted',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionDetails: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', ComplaintSchema);
