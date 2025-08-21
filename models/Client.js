const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // STEP 1: Basic Information
  clientId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'CL' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  ownerContactName: {
    type: String,
    required: [true, 'Owner/Contact name is required'],
    trim: true,
    maxlength: [100, 'Owner name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number']
  },
  businessAddress: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true }
  },
  onboardingDate: {
    type: Date,
    default: Date.now
  },
  assignedSalesRep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // STEP 2: Business Information (keeping existing structure)
  businessType: {
    type: String,
    enum: ['jewellery', 'pawn'],
    required: true
  },
  businessCategory: {
    type: String,
    trim: true
  },
  targetAudience: {
    type: String,
    trim: true
  },
  businessDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Business description cannot exceed 1000 characters']
  },

  // STEP 3: Domain & Hosting Info
  domainHosting: {
    subdomain: {
      type: String,
      required: [true, 'Subdomain is required'],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens']
    },
    dnsStatus: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'pending'
    },
    frontendHostingPlatform: {
      type: String,
      enum: ['netlify', 'render'],
      default: 'netlify'
    },
    backendHostingPlatform: {
      type: String,
      enum: ['render', 'other'],
      default: 'render'
    },
    sslCertificateStatus: {
      type: String,
      enum: ['active', 'pending', 'expired', 'not_configured'],
      default: 'pending'
    },
    websiteThemeTemplate: {
      type: String,
      trim: true
    }
  },

  // STEP 4: Database & System Info
  databaseSystem: {
    databaseName: {
      type: String,
      required: [true, 'Database name is required'],
      trim: true
    },
    connectionUri: {
      type: String,
      required: [true, 'Database connection URI is required'],
      trim: true
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    lastBackupDate: {
      type: Date
    },
    serverEnvironment: { type: String, trim: true },
    storageUsage: { type: String, trim: true },
    backendRepoLink: {
      type: String,
      trim: true,
      match: [/^https:\/\/(github|gitlab)\.com\/.*$/, 'Please enter a valid GitHub or GitLab repository URL']
    }
  },

  // STEP 5: Billing & Payment Info
  billing: {
    setupCost: {
      paid: { type: Boolean, default: false },
      amount: { type: Number, min: 0 }
    },
    maintenanceFee: {
      amount: { type: Number, required: [true, 'Maintenance fee amount is required'], min: 0 },
      currency: { type: String, default: 'INR' }
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: [true, 'Billing cycle is required']
    },
    lastPaymentDate: {
      type: Date
    },
    nextPaymentDate: {
      type: Date,
      required: [true, 'Next payment date is required']
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'bank_transfer', 'card'],
      required: [true, 'Payment method is required']
    },
    pendingDues: {
      amount: { type: Number, default: 0, min: 0 },
      description: { type: String, trim: true }
    }
  },

  // STEP 6: Service & Support Logs
  serviceSupport: {
    supportTicketsCount: { type: Number, default: 0, min: 0 },
    ticketSystemLink: { type: String, trim: true },
    lastSupportRequestDate: { type: Date },
    serviceLevel: {
      type: String,
      enum: ['basic', 'premium', 'custom'],
      default: 'basic'
    },
    customFeaturesRequested: { type: String, trim: true },
    previousIssuesHistory: { type: String, trim: true },
    ongoingIssues: { type: String, trim: true }
  },

  // STEP 7: Automation & Notifications
  automationNotifications: {
    autoEmailAlerts: { type: Boolean, default: true },
    backupCompleted: { type: Boolean, default: true },
    paymentReminder: { type: Boolean, default: true },
    sslExpiry: { type: Boolean, default: true },
    domainRenewal: { type: Boolean, default: true },
    supportSlaReminder: { type: Boolean, default: true },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      whatsappNotifications: { type: Boolean, default: false }
    }
  },

  // STEP 8: Attachments & Notes
  attachmentsNotes: {
    contractPdf: { type: String, trim: true },
    customDesignFiles: { type: String, trim: true },
    clientSpecificInstructions: { type: String, trim: true },
    internalNotes: { type: String, trim: true }
  },

  // General fields
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'terminated'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt field before saving
clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
clientSchema.index({ clientId: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ businessName: 1 });
clientSchema.index({ status: 1, createdAt: -1 });
clientSchema.index({ 'domainHosting.subdomain': 1 });
clientSchema.index({ assignedSalesRep: 1 });
clientSchema.index({ 'billing.nextPaymentDate': 1 });

module.exports = mongoose.model('Client', clientSchema);