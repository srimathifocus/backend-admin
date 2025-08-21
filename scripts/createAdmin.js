require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createFirstAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('⚠️  Super admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create first super admin
    const adminData = {
      username: 'superadmin',
      email: 'admin@company.com', // Change this to your email
      password: 'Admin@123', // Change this to a secure password
      role: 'super_admin'
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('🎉 Super admin created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createFirstAdmin();