const { body, param, query } = require('express-validator');

const validation = {
  // Auth validations
  signup: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3-30 characters')
      .isAlphanumeric()
      .withMessage('Username can only contain letters and numbers'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('role')
      .optional()
      .isIn(['admin', 'super_admin'])
      .withMessage('Role must be admin or super_admin')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateProfile: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3-30 characters')
      .isAlphanumeric()
      .withMessage('Username can only contain letters and numbers'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],

  // Contact message validations
  createContact: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2-100 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5-200 characters'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message must be between 10-1000 characters')
  ],

  updateContact: [
    body('status')
      .optional()
      .isIn(['new', 'in_progress', 'resolved', 'closed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('customerResponse')
      .optional()
      .isIn(['pending', 'satisfied', 'not_satisfied'])
      .withMessage('Invalid customer response'),
    body('customerFeedback')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Customer feedback cannot exceed 500 characters'),
    body('issueSolved')
      .optional()
      .isBoolean()
      .withMessage('Issue solved must be true or false')
  ],

  addNote: [
    body('note')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Note must be between 5-500 characters')
  ],

  // Demo request validations
  createDemo: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2-100 characters'),
    body('business')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Business name must be between 2-200 characters'),
    body('phone')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('businessType')
      .isIn(['retail-store', 'restaurant', 'service-business', 'e-commerce', 'manufacturing', 'healthcare', 'education', 'real-estate', 'construction', 'consulting', 'other'])
      .withMessage('Invalid business type'),
    body('currentSoftware')
      .optional()
      .isIn(['none', 'excel', 'tally', 'quickbooks', 'zoho', 'other'])
      .withMessage('Invalid current software'),
    body('preferredTime')
      .trim()
      .notEmpty()
      .withMessage('Preferred time is required')
  ],

  updateDemo: [
    body('status')
      .optional()
      .isIn(['pending', 'demo_scheduled', 'demo_completed', 'demo_accepted', 'on_proceed', 'converted', 'rejected'])
      .withMessage('Invalid status'),
    body('demoDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid demo date format'),
    body('demoNotes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Demo notes cannot exceed 500 characters'),
    body('customerResponse')
      .optional()
      .isIn(['pending', 'okay', 'not_okay'])
      .withMessage('Invalid customer response'),
    body('customerFeedback')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Customer feedback cannot exceed 500 characters'),
    body('conversionValue')
      .optional()
      .isNumeric()
      .withMessage('Conversion value must be a number')
      .custom((value) => value >= 0)
      .withMessage('Conversion value cannot be negative'),
    body('followUpDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid follow-up date format'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority')
  ],

  // Admin management validations
  createAdmin: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3-30 characters')
      .isAlphanumeric()
      .withMessage('Username can only contain letters and numbers'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('role')
      .optional()
      .isIn(['admin', 'super_admin'])
      .withMessage('Role must be admin or super_admin')
  ],

  updateAdmin: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3-30 characters')
      .isAlphanumeric()
      .withMessage('Username can only contain letters and numbers'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('role')
      .optional()
      .isIn(['admin', 'super_admin'])
      .withMessage('Role must be admin or super_admin'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be true or false')
  ],

  // Onboarding validations
  createOnboarding: [
    body('personalDetails.name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2-100 characters'),
    body('personalDetails.fatherName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Father name must be between 2-100 characters'),
    body('personalDetails.address')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Address must be between 10-500 characters'),
    body('personalDetails.state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2-50 characters'),
    body('personalDetails.district')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('District must be between 2-50 characters'),
    body('personalDetails.phoneNumber1')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('personalDetails.phoneNumber2')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('personalDetails.nomineeName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nominee name must be between 2-100 characters')
  ],

  updateOnboarding: [
    body('personalDetails.name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2-100 characters'),
    body('personalDetails.fatherName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Father name must be between 2-100 characters'),
    body('personalDetails.address')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Address must be between 10-500 characters'),
    body('personalDetails.state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2-50 characters'),
    body('personalDetails.district')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('District must be between 2-50 characters'),
    body('personalDetails.phoneNumber1')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('personalDetails.phoneNumber2')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('personalDetails.nomineeName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nominee name must be between 2-100 characters'),
    body('businessDetails.businessName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Business name must be between 2-200 characters'),
    body('businessDetails.address')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Business address must be between 10-500 characters'),
    body('businessDetails.state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Business state must be between 2-50 characters'),
    body('businessDetails.district')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Business district must be between 2-50 characters'),
    body('businessDetails.phoneNumber')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit business phone number'),
    body('businessDetails.gstNumber')
      .optional()
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .withMessage('Please provide a valid GST number'),
    body('businessDetails.businessDescription')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Business description must be between 10-1000 characters'),
    body('businessDetails.businessSize')
      .optional()
      .isIn(['Small', 'Medium', 'Large', 'Enterprise'])
      .withMessage('Invalid business size'),
    body('businessDetails.yearsOfBusiness')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Years of business must be between 0-100'),
    body('planDetails.maintenanceFrequency')
      .optional()
      .isIn(['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'])
      .withMessage('Invalid maintenance frequency'),
    body('paymentDetails.planPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Plan price must be a positive number'),
    body('paymentDetails.projectPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Project price must be a positive number'),
    body('paymentDetails.hostingYearlyPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Hosting yearly price must be a positive number'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters')
  ],

  updateOnboardingStatus: [
    body('status')
      .isIn(['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'])
      .withMessage('Invalid status')
  ],

  // Client management validations (8-Step System)
  createClient: [
    // STEP 1: Basic Information - ALL MANDATORY
    body('businessName')
      .notEmpty()
      .withMessage('Business name is required')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Business name must be between 2-200 characters'),
    body('ownerContactName')
      .notEmpty()
      .withMessage('Owner/Contact name is required')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Owner/Contact name must be between 2-100 characters'),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('businessAddress.street')
      .notEmpty()
      .withMessage('Street address is required')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Street address must be between 1-200 characters'),
    body('businessAddress.city')
      .notEmpty()
      .withMessage('City is required')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('City must be between 1-100 characters'),
    body('businessAddress.state')
      .notEmpty()
      .withMessage('State is required')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('State must be between 1-100 characters'),
    body('businessAddress.pincode')
      .notEmpty()
      .withMessage('Pincode is required')
      .matches(/^[1-9][0-9]{5}$/)
      .withMessage('Please provide a valid 6-digit pincode'),
    body('onboardingDate')
      .notEmpty()
      .withMessage('Onboarding date is required')
      .isISO8601()
      .withMessage('Invalid onboarding date format'),
    body('assignedSalesRep')
      .notEmpty()
      .withMessage('Assigned sales rep is required')
      .isMongoId()
      .withMessage('Invalid assigned sales/support rep ID'),
    
    // STEP 2: Business Information - ALL MANDATORY
    body('businessType')
      .notEmpty()
      .withMessage('Business type is required')
      .isIn(['jewellery', 'pawn'])
      .withMessage('Invalid business type'),
    body('businessCategory')
      .notEmpty()
      .withMessage('Business category is required')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Business category must be between 1-100 characters'),
    body('businessDescription')
      .notEmpty()
      .withMessage('Business description is required')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Business description must be between 1-1000 characters'),

    // STEP 3: Domain & Hosting Info - ALL MANDATORY
    body('domainHosting.subdomain')
      .notEmpty()
      .withMessage('Subdomain is required')
      .trim()
      .toLowerCase()
      .matches(/^[a-z0-9\-]+$/)
      .withMessage('Subdomain can only contain lowercase letters, numbers, and hyphens')
      .isLength({ min: 3, max: 50 })
      .withMessage('Subdomain must be between 3-50 characters'),
    body('domainHosting.dnsStatus')
      .notEmpty()
      .withMessage('DNS status is required')
      .isIn(['active', 'pending', 'suspended'])
      .withMessage('Invalid DNS status'),
    body('domainHosting.frontendHostingPlatform')
      .notEmpty()
      .withMessage('Frontend hosting platform is required')
      .isIn(['netlify', 'render'])
      .withMessage('Invalid frontend hosting platform'),
    body('domainHosting.backendHostingPlatform')
      .notEmpty()
      .withMessage('Backend hosting platform is required')
      .isIn(['render', 'other'])
      .withMessage('Invalid backend hosting platform'),
    body('domainHosting.sslCertificateStatus')
      .notEmpty()
      .withMessage('SSL certificate status is required')
      .isIn(['active', 'pending', 'expired', 'not_configured'])
      .withMessage('Invalid SSL certificate status'),
    body('domainHosting.websiteTheme')
      .notEmpty()
      .withMessage('Website theme is required')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Website theme must be between 1-100 characters'),

    // STEP 4: Database & System Info - ALL MANDATORY
    body('databaseSystem.databaseName')
      .notEmpty()
      .withMessage('Database name is required')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Database name must be between 3-100 characters'),
    body('databaseSystem.connectionUri')
      .notEmpty()
      .withMessage('Database connection URI is required')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Database connection URI must be at least 10 characters'),
    body('databaseSystem.backupFrequency')
      .notEmpty()
      .withMessage('Backup frequency is required')
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Invalid backup frequency'),
    body('databaseSystem.lastBackupDate')
      .notEmpty()
      .withMessage('Last backup date is required')
      .isISO8601()
      .withMessage('Invalid last backup date format'),
    body('databaseSystem.serverEnvironment')
      .notEmpty()
      .withMessage('Server environment is required')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Server environment must be between 1-50 characters'),
    body('databaseSystem.storageUsage')
      .notEmpty()
      .withMessage('Storage usage is required')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Storage usage must be between 1-100 characters'),
    body('databaseSystem.backendRepoLink')
      .notEmpty()
      .withMessage('Backend repository link is required')
      .matches(/^https:\/\/(github|gitlab)\.com\/.*$/)
      .withMessage('Please enter a valid GitHub or GitLab repository URL'),

    // STEP 5: Billing & Payment Info - ALL MANDATORY
    body('billing.setupCost.paid')
      .notEmpty()
      .withMessage('Setup cost paid status is required')
      .isBoolean()
      .withMessage('Setup cost paid status must be true or false'),
    body('billing.setupCost.amount')
      .notEmpty()
      .withMessage('Setup cost amount is required')
      .isFloat({ min: 0 })
      .withMessage('Setup cost amount must be a positive number'),
    body('billing.maintenanceFee.amount')
      .notEmpty()
      .withMessage('Maintenance fee amount is required')
      .isFloat({ min: 0 })
      .withMessage('Maintenance fee amount must be a positive number'),
    body('billing.billingCycle')
      .notEmpty()
      .withMessage('Billing cycle is required')
      .isIn(['monthly', 'yearly'])
      .withMessage('Invalid billing cycle'),
    body('billing.lastPaymentDate')
      .notEmpty()
      .withMessage('Last payment date is required')
      .isISO8601()
      .withMessage('Invalid last payment date format'),
    body('billing.nextPaymentDate')
      .notEmpty()
      .withMessage('Next payment date is required')
      .isISO8601()
      .withMessage('Invalid next payment date format'),
    body('billing.paymentMethod')
      .notEmpty()
      .withMessage('Payment method is required')
      .isIn(['upi', 'bank_transfer', 'card'])
      .withMessage('Invalid payment method'),
    body('billing.pendingDues.amount')
      .notEmpty()
      .withMessage('Pending dues amount is required')
      .isFloat({ min: 0 })
      .withMessage('Pending dues must be a positive number'),

    // STEP 6: Service & Support Logs - ALL MANDATORY
    body('serviceSupport.supportTicketsCount')
      .notEmpty()
      .withMessage('Support tickets count is required')
      .isInt({ min: 0 })
      .withMessage('Support tickets count must be a non-negative integer'),
    body('serviceSupport.ticketSystemLink')
      .notEmpty()
      .withMessage('Ticket system link is required')
      .isURL()
      .withMessage('Please provide a valid ticket system URL'),
    body('serviceSupport.lastSupportRequestDate')
      .notEmpty()
      .withMessage('Last support request date is required')
      .isISO8601()
      .withMessage('Invalid last support request date format'),
    body('serviceSupport.serviceLevel')
      .notEmpty()
      .withMessage('Service level is required')
      .isIn(['basic', 'premium', 'custom'])
      .withMessage('Invalid service level'),
    body('serviceSupport.customFeaturesRequested')
      .notEmpty()
      .withMessage('Custom features requested is required')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Custom features requested must be between 1-1000 characters'),
    body('serviceSupport.previousIssuesHistory')
      .notEmpty()
      .withMessage('Previous issues history is required')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Previous issues history must be between 1-2000 characters'),

    // STEP 7: Automation & Notifications - ALL MANDATORY
    body('automationNotifications.autoEmailAlerts')
      .notEmpty()
      .withMessage('Auto email alerts setting is required')
      .isBoolean()
      .withMessage('Auto email alerts must be true or false'),
    body('automationNotifications.backupCompleted')
      .notEmpty()
      .withMessage('Backup completed notification setting is required')
      .isBoolean()
      .withMessage('Backup completed notification must be true or false'),
    body('automationNotifications.paymentReminder')
      .notEmpty()
      .withMessage('Payment reminder setting is required')
      .isBoolean()
      .withMessage('Payment reminder must be true or false'),
    body('automationNotifications.sslExpiry')
      .notEmpty()
      .withMessage('SSL expiry notification setting is required')
      .isBoolean()
      .withMessage('SSL expiry notification must be true or false'),
    body('automationNotifications.domainRenewal')
      .notEmpty()
      .withMessage('Domain renewal notification setting is required')
      .isBoolean()
      .withMessage('Domain renewal notification must be true or false'),
    body('automationNotifications.supportSlaReminder')
      .notEmpty()
      .withMessage('Support SLA reminder setting is required')
      .isBoolean()
      .withMessage('Support SLA reminder must be true or false'),

    // STEP 8: Attachments & Notes - ALL MANDATORY
    body('attachmentsNotes.contractPdf')
      .notEmpty()
      .withMessage('Contract PDF is required')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Contract PDF path must be between 1-500 characters'),
    body('attachmentsNotes.customDesignFiles')
      .notEmpty()
      .withMessage('Custom design files info is required')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Custom design files info must be between 1-1000 characters'),
    body('attachmentsNotes.clientSpecificInstructions')
      .notEmpty()
      .withMessage('Client specific instructions are required')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Client specific instructions must be between 1-2000 characters'),
    body('attachmentsNotes.internalNotes')
      .notEmpty()
      .withMessage('Internal notes are required')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Internal notes must be between 1-2000 characters')
  ],

  updateClient: [
    // All fields are optional for updates
    // STEP 1: Basic Information
    body('businessName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Business name must be between 2-200 characters'),
    body('ownerContactName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Owner/Contact name must be between 2-100 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('businessAddress.street')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Street address cannot exceed 200 characters'),
    body('businessAddress.city')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('City cannot exceed 100 characters'),
    body('businessAddress.state')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('State cannot exceed 100 characters'),
    body('businessAddress.pincode')
      .optional()
      .matches(/^[1-9][0-9]{5}$/)
      .withMessage('Please provide a valid 6-digit pincode'),
    body('onboardingDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid onboarding date format'),
    body('assignedSalesRep')
      .optional()
      .isMongoId()
      .withMessage('Invalid assigned sales/support rep ID'),

    // STEP 2: Business Information
    body('businessType')
      .optional()
      .isIn(['jewellery', 'pawn'])
      .withMessage('Invalid business type'),
    body('businessCategory')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Business category cannot exceed 100 characters'),
    body('businessDescription')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Business description cannot exceed 1000 characters'),

    // STEP 3: Domain & Hosting Info
    body('domainHosting.subdomain')
      .optional()
      .trim()
      .toLowerCase()
      .matches(/^[a-z0-9\-]+$/)
      .withMessage('Subdomain can only contain lowercase letters, numbers, and hyphens'),
    body('domainHosting.dnsStatus')
      .optional()
      .isIn(['active', 'pending', 'suspended'])
      .withMessage('Invalid DNS status'),
    body('domainHosting.frontendHostingPlatform')
      .optional()
      .isIn(['netlify', 'render'])
      .withMessage('Invalid frontend hosting platform'),
    body('domainHosting.backendHostingPlatform')
      .optional()
      .isIn(['render', 'other'])
      .withMessage('Invalid backend hosting platform'),
    body('domainHosting.sslCertificateStatus')
      .optional()
      .isIn(['active', 'pending', 'expired', 'not_configured'])
      .withMessage('Invalid SSL certificate status'),
    body('domainHosting.websiteTheme')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Website theme/template name cannot exceed 100 characters'),

    // STEP 4: Database & System Info
    body('databaseSystem.databaseName')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Database name must be between 3-100 characters'),
    body('databaseSystem.connectionUri')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Database connection URI is required'),
    body('databaseSystem.backupFrequency')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Invalid backup frequency'),
    body('databaseSystem.lastBackupDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid last backup date format'),
    body('databaseSystem.serverEnvironment')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Server environment info cannot exceed 50 characters'),
    body('databaseSystem.storageUsage')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Storage usage info cannot exceed 100 characters'),
    body('databaseSystem.backendRepoLink')
      .optional()
      .matches(/^https:\/\/(github|gitlab)\.com\/.*$/)
      .withMessage('Please enter a valid GitHub or GitLab repository URL'),

    // STEP 5: Billing & Payment Info
    body('billing.setupCost.paid')
      .optional()
      .isBoolean()
      .withMessage('Setup cost paid status must be true or false'),
    body('billing.setupCost.amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Setup cost amount must be a positive number'),
    body('billing.maintenanceFee.amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maintenance fee amount must be a positive number'),
    body('billing.billingCycle')
      .optional()
      .isIn(['monthly', 'yearly'])
      .withMessage('Invalid billing cycle'),
    body('billing.lastPaymentDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid last payment date format'),
    body('billing.nextPaymentDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid next payment date format'),
    body('billing.paymentMethod')
      .optional()
      .isIn(['upi', 'bank_transfer', 'card'])
      .withMessage('Invalid payment method'),
    body('billing.pendingDues')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Pending dues must be a positive number'),

    // STEP 6: Service & Support Logs
    body('serviceSupport.supportTicketsCount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Support tickets count must be a non-negative integer'),
    body('serviceSupport.ticketSystemLink')
      .optional()
      .isURL()
      .withMessage('Please provide a valid ticket system URL'),
    body('serviceSupport.lastSupportRequestDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid last support request date format'),
    body('serviceSupport.serviceLevel')
      .optional()
      .isIn(['basic', 'premium', 'custom'])
      .withMessage('Invalid service level'),
    body('serviceSupport.customFeaturesRequested')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Custom features requested cannot exceed 1000 characters'),
    body('serviceSupport.previousIssuesHistory')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Previous issues history cannot exceed 2000 characters'),
    body('serviceSupport.ongoingIssues')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Ongoing issues cannot exceed 1000 characters'),

    // STEP 7: Automation & Notifications
    body('automationNotifications.autoEmailAlerts')
      .optional()
      .isBoolean()
      .withMessage('Auto email alerts must be true or false'),
    body('automationNotifications.backupCompleted')
      .optional()
      .isBoolean()
      .withMessage('Backup completed notification must be true or false'),
    body('automationNotifications.paymentReminder')
      .optional()
      .isBoolean()
      .withMessage('Payment reminder must be true or false'),
    body('automationNotifications.sslExpiry')
      .optional()
      .isBoolean()
      .withMessage('SSL expiry notification must be true or false'),
    body('automationNotifications.domainRenewal')
      .optional()
      .isBoolean()
      .withMessage('Domain renewal notification must be true or false'),
    body('automationNotifications.supportSlaReminder')
      .optional()
      .isBoolean()
      .withMessage('Support SLA reminder must be true or false'),

    // STEP 8: Attachments & Notes
    body('attachmentsNotes.contractPdf')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Contract PDF path cannot exceed 500 characters'),
    body('attachmentsNotes.customDesignFiles')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Custom design files info cannot exceed 1000 characters'),
    body('attachmentsNotes.clientSpecificInstructions')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Client specific instructions cannot exceed 2000 characters'),
    body('attachmentsNotes.internalNotes')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Internal notes cannot exceed 2000 characters'),

    // Client Status
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended', 'terminated'])
      .withMessage('Invalid client status')
  ],

  addInternalNote: [
    body('note')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Note must be between 5-1000 characters'),
    body('isPrivate')
      .optional()
      .isBoolean()
      .withMessage('isPrivate must be true or false')
  ],

  addOngoingIssue: [
    body('issue')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Issue description must be between 5-500 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority level'),
    body('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('Invalid assigned admin ID')
  ],

  updatePayment: [
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Payment amount must be a positive number'),
    body('paymentDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid payment date format'),
    body('nextPaymentDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid next payment date format'),
    body('paymentMethod')
      .optional()
      .isIn(['upi', 'bank_transfer', 'card', 'cash'])
      .withMessage('Invalid payment method')
  ],

  // Parameter validations
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format')
  ]
};

module.exports = validation;