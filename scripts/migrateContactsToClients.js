require('dotenv').config();
const mongoose = require('mongoose');
const ContactMessage = require('../models/ContactMessage');
const Client = require('../models/Client');

const migrateContactsToClients = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all contact messages
    const contacts = await ContactMessage.find({}).populate('assignedTo');
    console.log(`📊 Found ${contacts.length} contact messages to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const contact of contacts) {
      try {
        // Check if client already exists with this email
        const existingClient = await Client.findOne({ email: contact.email });
        
        if (existingClient) {
          console.log(`⚠️  Client with email ${contact.email} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create new client from contact message
        const clientData = {
          // STEP 1: Basic Information
          businessName: contact.subject || `Business - ${contact.name}`,
          ownerContactName: contact.name,
          email: contact.email,
          phone: contact.phone,
          businessAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          onboardingDate: contact.createdAt,
          assignedSalesRep: contact.assignedTo?._id,

          // STEP 2: Business Information
          businessType: 'other', // Default, can be updated later
          businessCategory: '',
          targetAudience: '',
          businessDescription: contact.message,

          // STEP 3: Domain & Hosting Info
          domainHosting: {
            subdomain: contact.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.random().toString(36).substr(2, 4),
            dnsStatus: 'pending',
            frontendHostingPlatform: 'netlify',
            backendHostingPlatform: 'render',
            sslCertificateStatus: 'pending',
            websiteThemeTemplate: 'default'
          },

          // STEP 4: Database & System Info
          databaseSystem: {
            databaseName: `db_${contact.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`,
            connectionUri: 'mongodb://localhost:27017/placeholder', // Placeholder
            backupFrequency: 'weekly',
            lastBackupDate: null,
            serverEnvironment: {
              nodeVersion: '18.x',
              environment: 'production'
            },
            storageUsage: {
              mongodbUsage: '0 MB',
              lastChecked: new Date()
            },
            backendRepoLink: ''
          },

          // STEP 5: Billing & Payment Info
          billing: {
            setupCost: {
              paid: false,
              amount: 0
            },
            maintenanceFee: {
              amount: 1000, // Default amount, can be updated
              currency: 'INR'
            },
            billingCycle: 'monthly',
            lastPaymentDate: null,
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            paymentMethod: 'upi',
            pendingDues: {
              amount: 0,
              description: ''
            }
          },

          // STEP 6: Service & Support Logs
          serviceSupport: {
            supportTicketsRaised: {
              count: 1,
              ticketSystemLink: ''
            },
            lastSupportRequestDate: contact.createdAt,
            serviceLevel: 'basic',
            customFeaturesRequested: [],
            issuesHistory: [{
              issue: contact.message,
              fix: '',
              reportedDate: contact.createdAt,
              resolvedDate: contact.status === 'resolved' ? contact.updatedAt : null,
              status: contact.status === 'resolved' ? 'resolved' : 'open'
            }],
            ongoingIssues: contact.status !== 'resolved' ? [{
              issue: contact.message,
              priority: contact.priority || 'medium',
              reportedDate: contact.createdAt,
              assignedTo: contact.assignedTo?._id
            }] : []
          },

          // STEP 7: Automation & Notifications
          automationNotifications: {
            autoEmailAlerts: true,
            backupCompleted: true,
            paymentReminder: true,
            sslExpiry: true,
            domainRenewal: true,
            supportSlaReminder: true,
            notificationSettings: {
              emailNotifications: true,
              smsNotifications: false,
              whatsappNotifications: false
            }
          },

          // STEP 8: Attachments & Notes
          attachmentsNotes: {
            contractPdf: {
              filename: '',
              url: '',
              uploadedDate: null
            },
            customDesignFiles: [],
            clientSpecificInstructions: '',
            internalNotes: contact.adminNotes.map(note => ({
              note: note.note,
              addedBy: note.addedBy,
              addedDate: note.addedAt,
              isPrivate: true
            }))
          },

          // General fields
          status: contact.status === 'closed' ? 'inactive' : 'active',
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt
        };

        // Create new client
        const newClient = new Client(clientData);
        await newClient.save();

        console.log(`✅ Migrated contact ${contact.name} (${contact.email}) to client ${newClient.clientId}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating contact ${contact.email}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} contacts`);
    console.log(`⚠️  Skipped: ${skippedCount} contacts`);
    console.log(`📝 Total processed: ${contacts.length} contacts`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review the migrated clients in the admin panel');
    console.log('2. Update business types, billing amounts, and other details as needed');
    console.log('3. Configure domain and hosting information for each client');
    console.log('4. Set up proper database connections and backup schedules');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting Contact to Client Migration...\n');
  migrateContactsToClients();
}

module.exports = migrateContactsToClients;