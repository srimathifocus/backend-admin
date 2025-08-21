const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { auth } = require('../middleware/auth');
const validation = require('../utils/validation');

// @route   POST /api/demo
// @desc    Create a new demo request (Public endpoint for website forms)
// @access  Public
router.post('/', validation.createDemo, demoController.createDemo);

// @route   GET /api/demo
// @desc    Get all demo requests with filters and pagination
// @access  Private (Admin only)
router.get('/', auth, demoController.getAllDemos);

// @route   GET /api/demo/analytics
// @desc    Get demo analytics for dashboard
// @access  Private (Admin only)
router.get('/analytics', auth, demoController.getDemoAnalytics);

// @route   GET /api/demo/:id
// @desc    Get single demo request by ID
// @access  Private (Admin only)
router.get('/:id', auth, validation.mongoId, demoController.getDemoById);

// @route   PUT /api/demo/:id
// @desc    Update demo request
// @access  Private (Admin only)
router.put('/:id', auth, validation.mongoId, validation.updateDemo, demoController.updateDemo);

// @route   POST /api/demo/:id/notes
// @desc    Add admin note to demo request
// @access  Private (Admin only)
router.post('/:id/notes', auth, validation.mongoId, validation.addNote, demoController.addAdminNote);

// @route   DELETE /api/demo/:id
// @desc    Delete demo request
// @access  Private (Admin only)
router.delete('/:id', auth, validation.mongoId, demoController.deleteDemo);

module.exports = router;