const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const clientController = require('../controllers/clientController');
const { auth } = require('../middleware/auth');
const validation = require('../utils/validation');

// Legacy contact routes - kept for backward compatibility
// @route   POST /api/contact
// @desc    Create a new contact message (Public endpoint for website forms)
// @access  Public
router.post('/', validation.createContact, contactController.createContact);

// @route   GET /api/contact
// @desc    Get all contact messages with filters and pagination
// @access  Private (Admin only)
router.get('/', auth, contactController.getAllContacts);

// @route   GET /api/contact/:id
// @desc    Get single contact message by ID
// @access  Private (Admin only)
router.get('/:id', auth, validation.mongoId, contactController.getContactById);

// @route   PUT /api/contact/:id
// @desc    Update contact message
// @access  Private (Admin only)
router.put('/:id', auth, validation.mongoId, contactController.updateContact);

// @route   POST /api/contact/:id/notes
// @desc    Add admin note to contact message
// @access  Private (Admin only)
router.post(
  '/:id/notes',
  auth,
  validation.mongoId,
  validation.addNote,
  contactController.addAdminNote
);

// @route   DELETE /api/contact/:id
// @desc    Delete contact message
// @access  Private (Admin only)
router.delete('/:id', auth, validation.mongoId, contactController.deleteContact);

module.exports = router;