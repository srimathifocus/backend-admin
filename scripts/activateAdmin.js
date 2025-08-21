const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function main() {
  try {
    const argv = process.argv.slice(2);

    // Parse args: --email <email> [--active true|false]
    let email = '';
    let active = true;

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      if ((arg === '--email' || arg === '-e') && argv[i + 1]) {
        email = argv[i + 1];
        i++;
      } else if ((arg === '--active' || arg === '-a') && argv[i + 1]) {
        active = argv[i + 1] === 'true';
        i++;
      } else if (arg.startsWith('--email=')) {
        email = arg.split('=')[1];
      } else if (arg.startsWith('--active=')) {
        active = arg.split('=')[1] === 'true';
      }
    }

    if (!email) {
      console.error('Usage: node scripts/activateAdmin.js --email <email> [--active true|false]');
      process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
      console.error('Missing MONGODB_URI in backend/.env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admin = await Admin.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { isActive: active } },
      { new: true }
    ).select('-password');

    if (!admin) {
      console.error(`Admin not found for email: ${email}`);
      process.exit(1);
    }

    console.log(`Admin ${admin.email} isActive set to:`, admin.isActive);
    process.exit(0);
  } catch (err) {
    console.error('Error activating admin:', err.message);
    process.exit(1);
  }
}

main();