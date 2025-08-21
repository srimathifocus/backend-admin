const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, requireSuperAdmin } = require('../middleware/auth');
const validation = require('../utils/validation');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin only)
router.get('/dashboard', auth, adminController.getDashboard);

// @route   GET /api/admin/system-stats
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/system-stats', auth, adminController.getSystemStats);

// Admin management routes (Super Admin only)

// @route   GET /api/admin/admins
// @desc    Get all admins
// @access  Private (Super Admin only)
router.get('/admins', auth, requireSuperAdmin, adminController.getAllAdmins);

// @route   POST /api/admin/admins
// @desc    Create new admin
// @access  Private (Super Admin only)
router.post('/admins', auth, requireSuperAdmin, validation.createAdmin, adminController.createAdmin);

// @route   PUT /api/admin/admins/:id
// @desc    Update admin
// @access  Private (Super Admin only)
router.put('/admins/:id', auth, requireSuperAdmin, validation.mongoId, validation.updateAdmin, adminController.updateAdmin);

// @route   DELETE /api/admin/admins/:id
// @desc    Delete admin
// @access  Private (Super Admin only)
router.delete('/admins/:id', auth, requireSuperAdmin, validation.mongoId, adminController.deleteAdmin);

module.exports = router;