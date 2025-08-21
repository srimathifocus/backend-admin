const mongoose = require('mongoose');

const demoRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  business: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: [
      'retail-store', 
      'restaurant', 
      'service-business', 
      'e-commerce', 
      'manufacturing', 
      'healthcare', 
      'education', 
      'real-estate',
      'construction',
      'consulting',
      'other'
    ]
  },
  currentSoftware: {
    type: String,
    enum: ['none', 'excel', 'tally', 'quickbooks', 'zoho', 'other'],
    default: 'none'
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'demo_scheduled', 'demo_completed', 'demo_accepted', 'on_proceed', 'converted', 'rejected'],
    default: 'pending'
  },
  demoDate: {
    type: Date
  },
  demoNotes: {
    type: String,
    trim: true
  },
  assignedTo: {
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
  }],
  customerResponse: {
    type: String,
    enum: ['pending', 'okay', 'not_okay'],
    default: 'pending'
  },
  customerFeedback: {
    type: String,
    trim: true
  },
  conversionValue: {
    type: Number,
    min: 0
  },
  followUpDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
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
demoRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
demoRequestSchema.index({ status: 1, createdAt: -1 });
demoRequestSchema.index({ email: 1 });
demoRequestSchema.index({ assignedTo: 1 });
demoRequestSchema.index({ businessType: 1 });

module.exports = mongoose.model('DemoRequest', demoRequestSchema);