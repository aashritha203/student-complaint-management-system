const express = require('express');
const { check } = require('express-validator');
const { getList, getStats, update, getStaffList, registerStaff } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Enforce authentication and role checking for admin/staff
router.use(protect);
router.use(authorize('admin', 'staff'));

// @route   GET api/admin/staff
// @desc    Get list of staff for assignments
// @access  Private (Admin/Staff)
router.get('/staff', getStaffList);

// @route   POST api/admin/register-staff
// @desc    Register a new administrative staff or admin user
// @access  Private (Admin only)
router.post(
  '/register-staff',
  authorize('admin'), // Restrict strictly to admin, overriding global admin/staff allow list
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email address').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required and must be admin or staff').isIn(['admin', 'staff']),
  ],
  registerStaff
);

// @route   GET api/admin/stats
// @desc    Get dashboard metrics stats
// @access  Private (Admin/Staff)
router.get('/stats', getStats);

// @route   GET api/admin/complaints
// @desc    List all complaints with filtering/pagination
// @access  Private (Admin/Staff)
router.get('/complaints', getList);

// @route   PUT api/admin/complaints/:id
// @desc    Modify complaint assignment, status, priority, or resolution
// @access  Private (Admin/Staff)
router.put(
  '/complaints/:id',
  [
    check('status', 'Invalid status state').optional().isIn([
      'submitted',
      'under_review',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
    ]),
    check('priority', 'Invalid priority value').optional().isIn([
      'low',
      'medium',
      'high',
      'critical',
    ]),
  ],
  update
);

module.exports = router;
