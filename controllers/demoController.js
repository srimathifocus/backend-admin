const { validationResult } = require('express-validator');
const DemoRequest = require('../models/DemoRequest');

const demoController = {
  // Create a new demo request (for frontend form submission)
  createDemo: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        name,
        business,
        phone,
        email,
        businessType,
        currentSoftware,
        preferredTime
      } = req.body;

      const demoRequest = new DemoRequest({
        name,
        business,
        phone,
        email,
        businessType,
        currentSoftware,
        preferredTime
      });

      await demoRequest.save();

      res.status(201).json({
        success: true,
        message: 'Demo request submitted successfully',
        data: { demoRequest }
      });

    } catch (error) {
      console.error('Create demo error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get all demo requests with pagination and filters (Admin only)
  getAllDemos: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const {
        status,
        businessType,
        assignedTo,
        customerResponse,
        priority,
        search,
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;

      // Build filter object
      let filter = {};
      
      if (status) filter.status = status;
      if (businessType) filter.businessType = businessType;
      if (assignedTo) filter.assignedTo = assignedTo;
      if (customerResponse) filter.customerResponse = customerResponse;
      if (priority) filter.priority = priority;
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { business: { $regex: search, $options: 'i' } }
        ];
      }

      // Sort object
      const sort = {};
      sort[sortBy] = order === 'desc' ? -1 : 1;

      const demos = await DemoRequest.find(filter)
        .populate('assignedTo', 'username email')
        .populate('adminNotes.addedBy', 'username')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await DemoRequest.countDocuments(filter);

      // Get status counts
      const statusCounts = await DemoRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Get business type counts
      const businessTypeCounts = await DemoRequest.aggregate([
        { $group: { _id: '$businessType', count: { $sum: 1 } } }
      ]);

      res.json({
        success: true,
        data: {
          demos,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          businessTypeCounts: businessTypeCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      });

    } catch (error) {
      console.error('Get all demos error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get single demo request by ID
  getDemoById: async (req, res) => {
    try {
      const { id } = req.params;

      const demo = await DemoRequest.findById(id)
        .populate('assignedTo', 'username email')
        .populate('adminNotes.addedBy', 'username email');

      if (!demo) {
        return res.status(404).json({
          success: false,
          message: 'Demo request not found'
        });
      }

      res.json({
        success: true,
        data: { demo }
      });

    } catch (error) {
      console.error('Get demo by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Update demo request status and details
  updateDemo: async (req, res) => {
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
        demoDate,
        demoNotes,
        assignedTo,
        customerResponse,
        customerFeedback,
        conversionValue,
        followUpDate,
        priority
      } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (demoDate) updateData.demoDate = new Date(demoDate);
      if (demoNotes) updateData.demoNotes = demoNotes;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (customerResponse) updateData.customerResponse = customerResponse;
      if (customerFeedback) updateData.customerFeedback = customerFeedback;
      if (conversionValue !== undefined) updateData.conversionValue = conversionValue;
      if (followUpDate) updateData.followUpDate = new Date(followUpDate);
      if (priority) updateData.priority = priority;

      const demo = await DemoRequest.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'username email');

      if (!demo) {
        return res.status(404).json({
          success: false,
          message: 'Demo request not found'
        });
      }

      res.json({
        success: true,
        message: 'Demo request updated successfully',
        data: { demo }
      });

    } catch (error) {
      console.error('Update demo error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Add admin note to demo request
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
      let { note } = req.body;

      // Extra safety: validate ObjectId explicitly
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }

      // Normalize and validate note
      note = (note || '').toString().trim();
      if (note.length < 5 || note.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Note must be between 5-500 characters'
        });
      }

      // Ensure authenticated admin present
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Use atomic update to avoid validating the entire document
      const updatedDemo = await DemoRequest.findByIdAndUpdate(
        id,
        {
          $push: {
            adminNotes: {
              note,
              addedBy: req.admin.id,
              addedAt: new Date()
            }
          },
          $set: { updatedAt: new Date() }
        },
        { new: true, runValidators: false }
      );

      if (!updatedDemo) {
        return res.status(404).json({
          success: false,
          message: 'Demo request not found'
        });
      }

      // Populate the newly added note author
      await updatedDemo.populate('adminNotes.addedBy', 'username email');

      return res.json({
        success: true,
        message: 'Admin note added successfully',
        data: { demo: updatedDemo }
      });

    } catch (error) {
      console.error('Add admin note error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Delete demo request
  deleteDemo: async (req, res) => {
    try {
      const { id } = req.params;

      const demo = await DemoRequest.findByIdAndDelete(id);
      if (!demo) {
        return res.status(404).json({
          success: false,
          message: 'Demo request not found'
        });
      }

      res.json({
        success: true,
        message: 'Demo request deleted successfully'
      });

    } catch (error) {
      console.error('Delete demo error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get analytics data for dashboard
  getDemoAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const analytics = await DemoRequest.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            pendingRequests: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            scheduledDemos: { $sum: { $cond: [{ $eq: ['$status', 'demo_scheduled'] }, 1, 0] } },
            completedDemos: { $sum: { $cond: [{ $eq: ['$status', 'demo_completed'] }, 1, 0] } },
            acceptedDemos: { $sum: { $cond: [{ $eq: ['$status', 'demo_accepted'] }, 1, 0] } },
            convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            totalConversionValue: { $sum: '$conversionValue' },
            avgConversionValue: { $avg: '$conversionValue' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          analytics: analytics[0] || {
            totalRequests: 0,
            pendingRequests: 0,
            scheduledDemos: 0,
            completedDemos: 0,
            acceptedDemos: 0,
            convertedLeads: 0,
            totalConversionValue: 0,
            avgConversionValue: 0
          }
        }
      });

    } catch (error) {
      console.error('Get demo analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
};

module.exports = demoController;