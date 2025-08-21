const Admin = require('../models/Admin');
const ContactMessage = require('../models/ContactMessage');
const DemoRequest = require('../models/DemoRequest');
const { validationResult } = require('express-validator');

const adminController = {
  // Get dashboard analytics
  getDashboard: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Get contact messages analytics
      const contactAnalytics = await ContactMessage.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalContacts: { $sum: 1 },
            newContacts: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
            inProgressContacts: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
            resolvedContacts: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
            closedContacts: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
          }
        }
      ]);

      // Get demo requests analytics
      const demoAnalytics = await DemoRequest.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalDemos: { $sum: 1 },
            pendingDemos: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            scheduledDemos: { $sum: { $cond: [{ $eq: ['$status', 'demo_scheduled'] }, 1, 0] } },
            completedDemos: { $sum: { $cond: [{ $eq: ['$status', 'demo_completed'] }, 1, 0] } },
            acceptedDemos: { $sum: { $cond: [{ $eq: ['$status', 'demo_accepted'] }, 1, 0] } },
            convertedDemos: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            totalConversionValue: { $sum: '$conversionValue' }
          }
        }
      ]);

      // Get recent activities
      const recentContacts = await ContactMessage.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email subject status createdAt');

      const recentDemos = await DemoRequest.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name business email status createdAt');

      // Get top business types for demos
      const businessTypeStats = await DemoRequest.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$businessType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const dashboardData = {
        contacts: contactAnalytics[0] || {
          totalContacts: 0,
          newContacts: 0,
          inProgressContacts: 0,
          resolvedContacts: 0,
          closedContacts: 0
        },
        demos: demoAnalytics[0] || {
          totalDemos: 0,
          pendingDemos: 0,
          scheduledDemos: 0,
          completedDemos: 0,
          acceptedDemos: 0,
          convertedDemos: 0,
          totalConversionValue: 0
        },
        recentActivities: {
          contacts: recentContacts,
          demos: recentDemos
        },
        businessTypeStats
      };

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get all admins (Super admin only)
  getAllAdmins: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const { search, role, isActive, sortBy = 'createdAt', order = 'desc' } = req.query;

      let filter = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const sort = {};
      sort[sortBy] = order === 'desc' ? -1 : 1;

      const admins = await Admin.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password');

      const total = await Admin.countDocuments(filter);

      res.json({
        success: true,
        data: {
          admins,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all admins error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Create new admin (Super admin only)
  createAdmin: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { username, email, password, role } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({
        $or: [{ email }, { username }]
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Admin with this email or username already exists'
        });
      }

      const admin = new Admin({
        username,
        email,
        password,
        role: role || 'admin'
      });

      await admin.save();

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: { admin }
      });

    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Update admin (Super admin only)
  updateAdmin: async (req, res) => {
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
      const { username, email, role, isActive } = req.body;

      // Check for duplicate username/email
      const existingAdmin = await Admin.findOne({
        $and: [
          { _id: { $ne: id } },
          { $or: [{ email }, { username }] }
        ]
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;

      const admin = await Admin.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'Admin updated successfully',
        data: { admin }
      });

    } catch (error) {
      console.error('Update admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Delete admin (Super admin only)
  deleteAdmin: async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent deleting self
      if (id === req.admin.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      const admin = await Admin.findByIdAndDelete(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Remove admin assignments from contacts and demos
      await ContactMessage.updateMany(
        { assignedTo: id },
        { $unset: { assignedTo: 1 } }
      );

      await DemoRequest.updateMany(
        { assignedTo: id },
        { $unset: { assignedTo: 1 } }
      );

      res.json({
        success: true,
        message: 'Admin deleted successfully'
      });

    } catch (error) {
      console.error('Delete admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get system statistics
  getSystemStats: async (req, res) => {
    try {
      const totalAdmins = await Admin.countDocuments();
      const activeAdmins = await Admin.countDocuments({ isActive: true });
      const totalContacts = await ContactMessage.countDocuments();
      const totalDemos = await DemoRequest.countDocuments();
      
      // Get data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentContacts = await ContactMessage.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });
      
      const recentDemos = await DemoRequest.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      res.json({
        success: true,
        data: {
          totalAdmins,
          activeAdmins,
          totalContacts,
          totalDemos,
          recentContacts,
          recentDemos
        }
      });

    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
};

module.exports = adminController;