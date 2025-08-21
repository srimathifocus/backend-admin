const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { auth } = require('../middleware/auth');
const validation = require('../utils/validation');

// @route   POST /api/client
// @desc    Create a new client
// @access  Private (Admin only)
router.post('/', auth, validation.createClient, clientController.createClient);

// @route   GET /api/client
// @desc    Get all clients with filters and pagination
// @access  Private (Admin only)
router.get('/', auth, clientController.getAllClients);

// @route   GET /api/client/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard-stats', auth, clientController.getDashboardStats);

// @route   GET /api/client/:id
// @desc    Get single client by MongoDB ID
// @access  Private (Admin only)
router.get('/:id', auth, validation.mongoId, clientController.getClientById);

// @route   GET /api/client/client-id/:clientId
// @desc    Get single client by custom client ID
// @access  Private (Admin only)
router.get('/client-id/:clientId', auth, clientController.getClientByClientId);

// @route   PUT /api/client/:id
// @desc    Update client information
// @access  Private (Admin only)
router.put('/:id', auth, validation.mongoId, validation.updateClient, clientController.updateClient);

// @route   POST /api/client/:id/notes
// @desc    Add internal note to client
// @access  Private (Admin only)
router.post('/:id/notes', auth, validation.mongoId, validation.addInternalNote, clientController.addInternalNote);

// @route   POST /api/client/:id/issues
// @desc    Add ongoing issue to client
// @access  Private (Admin only)
router.post('/:id/issues', auth, validation.mongoId, validation.addOngoingIssue, clientController.addOngoingIssue);

// @route   PUT /api/client/:id/payment
// @desc    Update payment information
// @access  Private (Admin only)
router.put('/:id/payment', auth, validation.mongoId, validation.updatePayment, clientController.updatePayment);

// @route   DELETE /api/client/:id
// @desc    Delete client (soft delete by default, permanent with ?permanent=true)
// @access  Private (Admin only)
router.delete('/:id', auth, validation.mongoId, clientController.deleteClient);

module.exports = router;