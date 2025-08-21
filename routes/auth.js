const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validation = require('../utils/validation');

// @route   POST /api/auth/signup
// @desc    Register a new admin
// @access  Public (or restrict based on your needs)
router.post('/signup', validation.signup, authController.signup);

// @route   POST /api/auth/login
// @desc    Login admin
// @access  Public
router.post('/login', validation.login, authController.login);

// @route   GET /api/auth/profile
// @desc    Get current admin profile
// @access  Private
router.get('/profile', auth, authController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update admin profile
// @access  Private
router.put('/profile', auth, validation.updateProfile, authController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change admin password
// @access  Private
router.put('/change-password', auth, validation.changePassword, authController.changePassword);

module.exports = router;