const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  // Step 1: Personal Details
  personalDetails: {
    name: {
      type: String,
      trim: true
    },
    fatherName: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    phoneNumber1: {
      type: String,
      trim: true
    },
    phoneNumber2: {
      type: String,
      trim: true
    },
    nomineeName: {
      type: String,
      trim: true
    }
  },

  // Step 2: Business Details
  businessDetails: {
    businessName: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    },
    businessDescription: {
      type: String,
      trim: true
    },
    businessSize: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'Enterprise'],
      trim: true
    },
    yearsOfBusiness: {
      type: Number,
      min: 0
    }
  },

  // Step 3: Plan Details
  planDetails: {
    accessType: {
      type: String,
      default: 'Lifetime Access',
      trim: true
    },
    maintenanceFrequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'],
      trim: true
    },
    customPricing: {
      type: Boolean,
      default: false
    },
    pricingData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },

  // Step 4: Payment Details
  paymentDetails: {
    planPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    projectPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    hostingYearlyPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    additionalCosts: {
      constant: {
        type: Number,
        default: 0,
        min: 0
      },
      hosting: {
        type: Number,
        default: 0,
        min: 0
      },
      domain: {
        type: Number,
        default: 0,
        min: 0
      },
      storage: {
        type: Number,
        default: 0,
        min: 0
      },
      maintenance: {
        type: Number,
        default: 0,
        min: 0
      },
      websiteCost: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },

  // Step 5: Notes (Optional)
  notes: {
    type: String,
    trim: true
  },

  // Status and metadata
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  completedSteps: [{
    type: Number,
    min: 1,
    max: 5
  }],
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  adminNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
onboardingSchema.index({ status: 1, createdAt: -1 });
onboardingSchema.index({ 'personalDetails.name': 1 });
onboardingSchema.index({ 'businessDetails.businessName': 1 });

// Virtual for full name
onboardingSchema.virtual('fullName').get(function() {
  return `${this.personalDetails.name} (${this.personalDetails.fatherName})`;
});

// Method to calculate total amount
onboardingSchema.methods.calculateTotal = function() {
  const { planPrice, projectPrice, hostingYearlyPrice, additionalCosts } = this.paymentDetails;
  const additionalTotal = Object.values(additionalCosts).reduce((sum, cost) => sum + (cost || 0), 0);
  return planPrice + projectPrice + hostingYearlyPrice + additionalTotal;
};

// Method to mark step as completed
onboardingSchema.methods.completeStep = function(stepNumber) {
  if (!this.completedSteps.includes(stepNumber)) {
    this.completedSteps.push(stepNumber);
  }
  this.currentStep = Math.max(this.currentStep, stepNumber + 1);
  if (this.currentStep > 5) {
    this.currentStep = 5;
  }
};

// Pre-save middleware to calculate total
onboardingSchema.pre('save', function(next) {
  if (this.paymentDetails && this.paymentDetails.planPrice !== undefined) {
    this.paymentDetails.totalAmount = this.calculateTotal();
  }
  next();
});

module.exports = mongoose.model('Onboarding', onboardingSchema);