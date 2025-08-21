const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { auth, optionalAuth } = require('../middleware/auth');
const validation = require('../utils/validation');

// @route   GET /api/onboarding/districts
// @desc    Get Tamil Nadu districts list
// @access  Public
router.get('/districts', onboardingController.getDistricts);

// @route   GET /api/onboarding/stats
// @desc    Get onboarding statistics
// @access  Private (Admin only)
router.get('/stats', auth, onboardingController.getOnboardingStats);

// @route   POST /api/onboarding
// @desc    Create a new onboarding
// @access  Public
router.post('/', validation.createOnboarding, onboardingController.createOnboarding);

// @route   GET /api/onboarding
// @desc    Get all onboardings with filters and pagination
// @access  Public (limited data) / Private (full data for admin)
router.get('/', optionalAuth, onboardingController.getAllOnboardings);

// @route   GET /api/onboarding/:id
// @desc    Get single onboarding by ID
// @access  Private (Admin only)
router.get('/:id', auth, validation.mongoId, onboardingController.getOnboardingById);

// @route   PUT /api/onboarding/:id
// @desc    Update onboarding
// @access  Public (for draft) / Private (for submitted)
router.put('/:id', validation.mongoId, validation.updateOnboarding, onboardingController.updateOnboarding);

// @route   PUT /api/onboarding/:id/step/:stepNumber
// @desc    Update specific onboarding step
// @access  Public (for draft) / Private (for submitted)
router.put('/:id/step/:stepNumber', validation.mongoId, onboardingController.updateOnboardingStep);

// @route   POST /api/onboarding/:id/submit
// @desc    Submit onboarding for review
// @access  Public
router.post('/:id/submit', validation.mongoId, onboardingController.submitOnboarding);

// @route   PUT /api/onboarding/:id/status
// @desc    Update onboarding status (Admin only)
// @access  Private (Admin only)
router.put('/:id/status', auth, validation.mongoId, validation.updateOnboardingStatus, onboardingController.updateOnboardingStatus);

// @route   POST /api/onboarding/:id/notes
// @desc    Add admin note to onboarding
// @access  Private (Admin only)
router.post('/:id/notes', auth, validation.mongoId, validation.addNote, onboardingController.addAdminNote);

// @route   DELETE /api/onboarding/:id
// @desc    Delete onboarding
// @access  Private (Admin only)
router.delete('/:id', auth, validation.mongoId, onboardingController.deleteOnboarding);

module.exports = router;