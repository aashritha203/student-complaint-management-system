const authService = require('../services/authService');
const { validationResult } = require('express-validator');

// Register new user
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await authService.loginUser(email, password);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
