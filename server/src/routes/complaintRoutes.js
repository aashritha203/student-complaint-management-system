const express = require('express');
const { check } = require('express-validator');
const { create, getStudentList, getDetails, addCommentTo } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All complaint routes are protected
router.use(protect);

// @route   POST api/complaints
// @desc    Submit a new complaint
// @access  Private (Student)
router.post(
  '/',
  upload.single('attachment'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Please select a valid category').isIn([
      'Infrastructure',
      'Hostel',
      'Wi-Fi',
      'Academics',
      'Cleanliness',
      'Transportation',
      'Other',
    ]),
    check('location', 'Location room or area description is required').not().isEmpty(),
  ],
  create
);

// @route   GET api/complaints
// @desc    List student's own complaints
// @access  Private (Student)
router.get('/', getStudentList);

// @route   GET api/complaints/:id
// @desc    Read details and comments for student complaint
// @access  Private (Student/Admin/Staff)
router.get('/:id', getDetails);

// @route   POST api/complaints/:id/comments
// @desc    Add public message / note to complaint
// @access  Private (Student/Admin/Staff)
router.post(
  '/:id/comments',
  [check('message', 'Message content is required').not().isEmpty()],
  addCommentTo
);

module.exports = router;
