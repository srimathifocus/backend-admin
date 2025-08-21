const { validationResult } = require('express-validator');
const Client = require('../models/Client');

const clientController = {
  // Create a new client (Admin only)
  createClient: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const clientData = req.body;
      
      // Set the assigned sales rep to the current admin if not specified
      if (!clientData.assignedSalesRep) {
        clientData.assignedSalesRep = req.admin.id;
      }

      const client = new Client(clientData);
      await client.save();

      // Populate references
      await client.populate('assignedSalesRep', 'username email');

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: { client }
      });

    } catch (error) {
      console.error('Create client error:', error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          error: `A client with this ${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get all clients with pagination and filters (Admin only)
  getAllClients: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const {
        status,
        businessType,
        serviceLevel,
        assignedSalesRep,
        dnsStatus,
        billingCycle,
        search,
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;

      // Build filter object
      let filter = {};
      
      if (status) filter.status = status;
      if (businessType) filter.businessType = businessType;
      if (serviceLevel) filter['serviceSupport.serviceLevel'] = serviceLevel;
      if (assignedSalesRep) filter.assignedSalesRep = assignedSalesRep;
      if (dnsStatus) filter['domainHosting.dnsStatus'] = dnsStatus;
      if (billingCycle) filter['billing.billingCycle'] = billingCycle;
      
      if (search) {
        filter.$or = [
          { businessName: { $regex: search, $options: 'i' } },
          { ownerContactName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { clientId: { $regex: search, $options: 'i' } },
          { 'domainHosting.subdomain': { $regex: search, $options: 'i' } }
        ];
      }

      // Sort object
      const sort = {};
      sort[sortBy] = order === 'desc' ? -1 : 1;

      const clients = await Client.find(filter)
        .populate('assignedSalesRep', 'username email')
        .populate('serviceSupport.ongoingIssues.assignedTo', 'username')
        .populate('attachmentsNotes.internalNotes.addedBy', 'username')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Client.countDocuments(filter);

      // Get status counts
      const statusCounts = await Client.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Get billing cycle counts
      const billingCycleCounts = await Client.aggregate([
        { $group: { _id: '$billing.billingCycle', count: { $sum: 1 } } }
      ]);

      // Get upcoming payments (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const upcomingPayments = await Client.find({
        'billing.nextPaymentDate': { $lte: thirtyDaysFromNow },
        status: 'active'
      }).select('businessName billing.nextPaymentDate billing.maintenanceFee').limit(10);

      res.json({
        success: true,
        data: {
          clients,
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
          billingCycleCounts: billingCycleCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          upcomingPayments
        }
      });

    } catch (error) {
      console.error('Get all clients error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get single client by ID
  getClientById: async (req, res) => {
    try {
      const { id } = req.params;

      const client = await Client.findById(id)
        .populate('assignedSalesRep', 'username email phone')
        .populate('serviceSupport.customFeaturesRequested.assignedTo', 'username')
        .populate('serviceSupport.ongoingIssues.assignedTo', 'username')
        .populate('attachmentsNotes.internalNotes.addedBy', 'username email');

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      res.json({
        success: true,
        data: { client }
      });

    } catch (error) {
      console.error('Get client by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get client by client ID (custom ID)
  getClientByClientId: async (req, res) => {
    try {
      const { clientId } = req.params;

      const client = await Client.findOne({ clientId })
        .populate('assignedSalesRep', 'username email phone')
        .populate('serviceSupport.customFeaturesRequested.assignedTo', 'username')
        .populate('serviceSupport.ongoingIssues.assignedTo', 'username')
        .populate('attachmentsNotes.internalNotes.addedBy', 'username email');

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      res.json({
        success: true,
        data: { client }
      });

    } catch (error) {
      console.error('Get client by client ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Update client information
  updateClient: async (req, res) => {
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
      const updateData = req.body;

      const client = await Client.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedSalesRep', 'username email');

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      res.json({
        success: true,
        message: 'Client updated successfully',
        data: { client }
      });

    } catch (error) {
      console.error('Update client error:', error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          error: `A client with this ${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Add internal note to client
  addInternalNote: async (req, res) => {
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
      const { note, isPrivate = true } = req.body;

      const client = await Client.findById(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      client.attachmentsNotes.internalNotes.push({
        note,
        addedBy: req.admin.id,
        isPrivate
      });

      await client.save();

      // Populate the newly added note
      await client.populate('attachmentsNotes.internalNotes.addedBy', 'username email');

      res.json({
        success: true,
        message: 'Internal note added successfully',
        data: { client }
      });

    } catch (error) {
      console.error('Add internal note error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Add ongoing issue
  addOngoingIssue: async (req, res) => {
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
      const { issue, priority = 'medium', assignedTo } = req.body;

      const client = await Client.findById(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      client.serviceSupport.ongoingIssues.push({
        issue,
        priority,
        assignedTo: assignedTo || req.admin.id
      });

      await client.save();

      // Populate the newly added issue
      await client.populate('serviceSupport.ongoingIssues.assignedTo', 'username');

      res.json({
        success: true,
        message: 'Ongoing issue added successfully',
        data: { client }
      });

    } catch (error) {
      console.error('Add ongoing issue error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Update payment information
  updatePayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, paymentDate, paymentMethod, nextPaymentDate } = req.body;

      const client = await Client.findById(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Update payment information
      if (paymentDate) client.billing.lastPaymentDate = new Date(paymentDate);
      if (nextPaymentDate) client.billing.nextPaymentDate = new Date(nextPaymentDate);
      if (paymentMethod) client.billing.paymentMethod = paymentMethod;
      
      // Clear pending dues if payment is made
      if (amount && amount > 0) {
        client.billing.pendingDues.amount = Math.max(0, client.billing.pendingDues.amount - amount);
      }

      await client.save();

      res.json({
        success: true,
        message: 'Payment information updated successfully',
        data: { client }
      });

    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const totalClients = await Client.countDocuments();
      const activeClients = await Client.countDocuments({ status: 'active' });
      const suspendedClients = await Client.countDocuments({ status: 'suspended' });
      
      // Clients with pending payments (overdue)
      const overduePayments = await Client.countDocuments({
        'billing.nextPaymentDate': { $lt: new Date() },
        status: 'active'
      });

      // Clients with ongoing issues
      const clientsWithIssues = await Client.countDocuments({
        'serviceSupport.ongoingIssues.0': { $exists: true }
      });

      // Monthly revenue calculation
      const monthlyRevenue = await Client.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $cond: [
                  { $eq: ['$billing.billingCycle', 'monthly'] },
                  '$billing.maintenanceFee.amount',
                  {
                    $cond: [
                      { $eq: ['$billing.billingCycle', 'yearly'] },
                      { $divide: ['$billing.maintenanceFee.amount', 12] },
                      { $divide: ['$billing.maintenanceFee.amount', 3] } // quarterly
                    ]
                  }
                ]
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          totalClients,
          activeClients,
          suspendedClients,
          overduePayments,
          clientsWithIssues,
          estimatedMonthlyRevenue: monthlyRevenue[0]?.total || 0
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  // Delete client (soft delete by changing status)
  deleteClient: async (req, res) => {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;

      if (permanent === 'true') {
        // Permanent delete
        const client = await Client.findByIdAndDelete(id);
        if (!client) {
          return res.status(404).json({
            success: false,
            message: 'Client not found'
          });
        }

        res.json({
          success: true,
          message: 'Client permanently deleted'
        });
      } else {
        // Soft delete - change status to terminated
        const client = await Client.findByIdAndUpdate(
          id,
          { status: 'terminated' },
          { new: true }
        );

        if (!client) {
          return res.status(404).json({
            success: false,
            message: 'Client not found'
          });
        }

        res.json({
          success: true,
          message: 'Client status changed to terminated',
          data: { client }
        });
      }

    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
};

module.exports = clientController;