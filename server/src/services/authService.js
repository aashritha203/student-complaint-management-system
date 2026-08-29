const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtsecretkeyforcollegesystem12345', {
    expiresIn: '30d',
  });
};

const registerUser = async (userData, isAdminCreator = false) => {
  const { name, email, password, role, department } = userData;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('Email already registered');
  }

  // Check if this is the first user in the database. If so, default them as 'admin'
  const isFirstUser = (await User.countDocuments({})) === 0;
  
  let finalRole = 'student';
  if (isFirstUser) {
    finalRole = 'admin';
  } else {
    // If request wants admin or staff, reject unless created by an admin
    if (role === 'admin' || role === 'staff') {
      if (!isAdminCreator) {
        throw new Error('Public registration for Admin or Staff roles is disabled.');
      }
      finalRole = role;
    } else {
      finalRole = 'student';
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: finalRole,
    department: finalRole === 'student' ? '' : (department || ''),
  });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    };
  } else {
    throw new Error('Invalid user details. User creation failed');
  }
};

const loginUser = async (email, password) => {
  // Find user and explicitly select password field
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    };
  } else {
    throw new Error('Invalid email or password credentials');
  }
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User profile not found');
  }
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
