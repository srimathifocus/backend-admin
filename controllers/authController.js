const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

const authController = {
  // Admin signup
  signup: async (req, res) => {
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

      // Create new admin
      const admin = new Admin({
        username,
        email,
        password,
        role: role || 'admin'
      });

      await admin.save();

      // Generate tokens
      const token = generateToken(admin._id);
      const refreshToken = generateRefreshToken(admin._id);

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: {
          admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role
          },
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Admin login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find admin by email
      const admin = await Admin.findOne({ email }).select('+password');
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account is inactive'
        });
      }

      // Compare password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Generate tokens
      const token = generateToken(admin._id);
      const refreshToken = generateRefreshToken(admin._id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            lastLogin: admin.lastLogin
          },
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get current admin profile
  getProfile: async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id);
      
      res.json({
        success: true,
        data: { admin }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Update admin profile
  updateProfile: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { username, email } = req.body;
      const adminId = req.admin.id;

      // Check for duplicate username/email
      const existingAdmin = await Admin.findOne({
        $and: [
          { _id: { $ne: adminId } },
          { $or: [{ email }, { username }] }
        ]
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      const admin = await Admin.findByIdAndUpdate(
        adminId,
        { username, email },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { admin }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const admin = await Admin.findById(req.admin.id).select('+password');

      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      admin.password = newPassword;
      await admin.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
};

module.exports = authController;