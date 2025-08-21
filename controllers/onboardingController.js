const Onboarding = require('../models/Onboarding');
const mongoose = require('mongoose');

// Tamil Nadu districts list
const tamilNaduDistricts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
  'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet',
  'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi',
  'Tiruchirappalli', 'Tirunelveli', 'Tirupattur', 'Tiruppur', 'Tiruvallur',
  'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
];

// @desc    Get Tamil Nadu districts
// @route   GET /api/onboarding/districts
// @access  Public
const getDistricts = async (req, res) => {
  try {
    res.json({
      success: true,
      data: tamilNaduDistricts.sort()
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new onboarding
// @route   POST /api/onboarding
// @access  Public
const createOnboarding = async (req, res) => {
  try {
    const onboarding = new Onboarding(req.body);
    await onboarding.save();

    res.status(201).json({
      success: true,
      message: 'Onboarding created successfully',
      data: onboarding
    });
  } catch (error) {
    console.error('Create onboarding error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all onboardings with filters and pagination
// @route   GET /api/onboarding
// @access  Private (Admin only)
const getAllOnboardings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { 'personalDetails.name': { $regex: search, $options: 'i' } },
        { 'personalDetails.fatherName': { $regex: search, $options: 'i' } },
        { 'businessDetails.businessName': { $regex: search, $options: 'i' } },
        { 'personalDetails.phoneNumber1': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with different population based on user type
    let query = Onboarding.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Only populate admin-specific fields if user is admin
    if (req.admin) {
      query = query
        .populate('reviewedBy', 'name email')
        .populate('adminNotes.addedBy', 'name email');
    }

    const [onboardings, total] = await Promise.all([
      query,
      Onboarding.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        onboardings: onboardings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all onboardings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single onboarding by ID
// @route   GET /api/onboarding/:id
// @access  Private (Admin only)
const getOnboardingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding ID'
      });
    }

    const onboarding = await Onboarding.findById(id)
      .populate('reviewedBy', 'name email')
      .populate('adminNotes.addedBy', 'name email');

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }

    res.json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    console.error('Get onboarding by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update onboarding
// @route   PUT /api/onboarding/:id
// @access  Public (for draft) / Private (for submitted)
const updateOnboarding = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding ID'
      });
    }

    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }

    // Check if user can edit (only drafts can be edited by public, others need admin)
    if (onboarding.status !== 'Draft' && !req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit submitted onboarding'
      });
    }

    // Update the onboarding
    Object.assign(onboarding, req.body);
    await onboarding.save();

    res.json({
      success: true,
      message: 'Onboarding updated successfully',
      data: onboarding
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update onboarding step
// @route   PUT /api/onboarding/:id/step/:stepNumber
// @access  Public (for draft) / Private (for submitted)
const updateOnboardingStep = async (req, res) => {
  try {
    const { id, stepNumber } = req.params;
    const stepNum = parseInt(stepNumber);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding ID'
      });
    }

    if (stepNum < 1 || stepNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid step number'
      });
    }

    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }

    // Check if user can edit
    if (onboarding.status !== 'Draft' && !req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit submitted onboarding'
      });
    }

    // Update specific step data
    const stepData = req.body;
    
    switch (stepNum) {
      case 1:
        onboarding.personalDetails = { ...onboarding.personalDetails, ...stepData };
        break;
      case 2:
        onboarding.businessDetails = { ...onboarding.businessDetails, ...stepData };
        break;
      case 3:
        onboarding.planDetails = { ...onboarding.planDetails, ...stepData };
        break;
      case 4:
        onboarding.paymentDetails = { ...onboarding.paymentDetails, ...stepData };
        break;
      case 5:
        onboarding.notes = stepData.notes || onboarding.notes;
        break;
    }

    // Mark step as completed
    onboarding.completeStep(stepNum);
    
    await onboarding.save();

    res.json({
      success: true,
      message: `Step ${stepNum} updated successfully`,
      data: onboarding
    });
  } catch (error) {
    console.error('Update onboarding step error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit onboarding
// @route   POST /api/onboarding/:id/submit
// @access  Public
const submitOnboarding = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding ID'
      });
    }

    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }

    if (onboarding.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Onboarding already submitted'
      });
    }

    // Check if all required steps are completed
    const requiredSteps = [1, 2, 3, 4]; // Step 5 is optional
    const missingSteps = requiredSteps.filter(step => !onboarding.completedSteps.includes(step));

    if (missingSteps.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required steps',
        missingSteps
      });
    }

    onboarding.status = 'Submitted';
    onboarding.submittedAt = new Date();
    await onboarding.save();

    res.json({
      success: true,
      message: 'Onboarding submitted successfully',
      data: onboarding
    });
  } catch (error) {
    console.error('Submit onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update onboarding status (Admin only)
// @route   PUT /api/onboarding/:id/status
// @access  Private (Admin only)
const updateOnboardingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding ID'
      });
    }

    const validStatuses = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }

    onboarding.status = status;
    onboarding.reviewedAt = new Date();
    onboarding.reviewedBy = req.admin.id;
    
    await onboarding.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: onboarding
    });
  } catch (error) {
    console.error('Update onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add admin note to onboarding
// @route   POST /api/onboarding/:id/notes
// @access  Private (Admin only)
const addAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding ID'
      });
    }

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }

    onboarding.adminNotes.push({
      note: note.trim(),
      addedBy: req.admin.id
    });

    await onboarding.save();

    // Populate the new note
    await onboarding.populate('adminNotes.addedBy', 'name email');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: onboarding
    });
  } catch (error) {
    console.error('Add admin note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete onboarding
// @route   DELETE /api/onboarding/:id
// @access  Private (Admin only)
const deleteOnboarding = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding ID'
      });
    }

    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }

    await Onboarding.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Onboarding deleted successfully'
    });
  } catch (error) {
    console.error('Delete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get onboarding statistics
// @route   GET /api/onboarding/stats
// @access  Private (Admin only)
const getOnboardingStats = async (req, res) => {
  try {
    const stats = await Onboarding.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOnboardings = await Onboarding.countDocuments();
    const recentOnboardings = await Onboarding.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('personalDetails.name businessDetails.businessName status createdAt');

    const statusCounts = {
      Draft: 0,
      Submitted: 0,
      'Under Review': 0,
      Approved: 0,
      Rejected: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        totalOnboardings,
        statusCounts,
        recentOnboardings
      }
    });
  } catch (error) {
    console.error('Get onboarding stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDistricts,
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  updateOnboardingStep,
  submitOnboarding,
  updateOnboardingStatus,
  addAdminNote,
  deleteOnboarding,
  getOnboardingStats
};