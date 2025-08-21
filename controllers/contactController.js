const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');

const contactController = {
  // Create a new contact message (for frontend form submission)
  createContact: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, phone, subject, message } = req.body;

      const contactMessage = new ContactMessage({
        name,
        email,
        phone,
        subject,
        message
      });

      await contactMessage.save();

      res.status(201).json({
        success: true,
        message: 'Contact message submitted successfully',
        data: { contactMessage }
      });

    } catch (error) {
      console.error('Create contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get all contact messages with pagination and filters (Admin only)
  getAllContacts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const {
        status,
        priority,
        assignedTo,
        customerResponse,
        issueSolved,
        search,
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;

      // Build filter object
      let filter = {};
      
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (assignedTo) filter.assignedTo = assignedTo;
      if (customerResponse) filter.customerResponse = customerResponse;
      if (issueSolved !== undefined) filter.issueSolved = issueSolved === 'true';
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      // Sort object
      const sort = {};
      sort[sortBy] = order === 'desc' ? -1 : 1;

      const contacts = await ContactMessage.find(filter)
        .populate('assignedTo', 'username email')
        .populate('adminNotes.addedBy', 'username')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await ContactMessage.countDocuments(filter);

      // Get status counts
      const statusCounts = await ContactMessage.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      res.json({
        success: true,
        data: {
          contacts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      });

    } catch (error) {
      console.error('Get all contacts error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get single contact message by ID
  getContactById: async (req, res) => {
    try {
      const { id } = req.params;

      const contact = await ContactMessage.findById(id)
        .populate('assignedTo', 'username email')
        .populate('adminNotes.addedBy', 'username email');

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found'
        });
      }

      res.json({
        success: true,
        data: { contact }
      });

    } catch (error) {
      console.error('Get contact by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Update contact message status and details
  updateContact: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const {
        status,
        priority,
        assignedTo,
        customerResponse,
        customerFeedback,
        issueSolved
      } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (customerResponse) updateData.customerResponse = customerResponse;
      if (customerFeedback) updateData.customerFeedback = customerFeedback;
      if (issueSolved !== undefined) updateData.issueSolved = issueSolved;

      const contact = await ContactMessage.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'username email');

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found'
        });
      }

      res.json({
        success: true,
        message: 'Contact message updated successfully',
        data: { contact }
      });

    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Add admin note to contact message
  addAdminNote: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { note } = req.body;

      const contact = await ContactMessage.findById(id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found'
        });
      }

      contact.adminNotes.push({
        note,
        addedBy: req.admin.id
      });

      await contact.save();

      // Populate the newly added note
      await contact.populate('adminNotes.addedBy', 'username email');

      res.json({
        success: true,
        message: 'Admin note added successfully',
        data: { contact }
      });

    } catch (error) {
      console.error('Add admin note error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Delete contact message
  deleteContact: async (req, res) => {
    try {
      const { id } = req.params;

      const contact = await ContactMessage.findByIdAndDelete(id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found'
        });
      }

      res.json({
        success: true,
        message: 'Contact message deleted successfully'
      });

    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
};

module.exports = contactController;