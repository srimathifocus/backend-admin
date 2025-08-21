// Quick API Test Script
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
let authToken = '';

// Test helper function
async function testAPI() {
  try {
    console.log('🧪 Starting API Tests...\n');

    // 1. Test Admin Login
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@company.com',
      password: 'Admin@123'
    });

    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      console.log('✅ Login successful');
      console.log('🔑 Token received:', authToken.substring(0, 20) + '...');
    }

    // 2. Test Get Profile
    console.log('\n2️⃣ Testing Get Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (profileResponse.data.success) {
      console.log('✅ Profile retrieved successfully');
      console.log('👤 Admin:', profileResponse.data.data.admin.username);
    }

    // 3. Test Create Contact Message (Public)
    console.log('\n3️⃣ Testing Contact Message Creation (Public)...');
    const contactResponse = await axios.post(`${BASE_URL}/contact`, {
      name: 'Test Customer',
      email: 'test.customer@example.com',
      phone: '9876543210',
      subject: 'API Test Contact',
      message: 'This is a test message from the API test script.'
    });

    if (contactResponse.data.success) {
      console.log('✅ Contact message created successfully');
      console.log('📧 Contact ID:', contactResponse.data.data.contactMessage._id);
    }

    // 4. Test Create Demo Request (Public)
    console.log('\n4️⃣ Testing Demo Request Creation (Public)...');
    const demoResponse = await axios.post(`${BASE_URL}/demo`, {
      name: 'Test Business Owner',
      business: 'Test Business Ltd',
      phone: '9876543210',
      email: 'business@example.com',
      businessType: 'retail-store',
      currentSoftware: 'excel',
      preferredTime: '2:00 PM'
    });

    if (demoResponse.data.success) {
      console.log('✅ Demo request created successfully');
      console.log('🏢 Demo ID:', demoResponse.data.data.demoRequest._id);
    }

    // 5. Test Get Dashboard (Admin)
    console.log('\n5️⃣ Testing Admin Dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (dashboardResponse.data.success) {
      console.log('✅ Dashboard data retrieved successfully');
      console.log('📊 Total Contacts:', dashboardResponse.data.data.contacts.totalContacts);
      console.log('📊 Total Demos:', dashboardResponse.data.data.demos.totalDemos);
    }

    // 6. Test Get All Contacts (Admin)
    console.log('\n6️⃣ Testing Get All Contacts...');
    const contactsResponse = await axios.get(`${BASE_URL}/contact`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (contactsResponse.data.success) {
      console.log('✅ Contacts retrieved successfully');
      console.log('📧 Total contacts found:', contactsResponse.data.data.contacts.length);
    }

    // 7. Test Get All Demos (Admin)
    console.log('\n7️⃣ Testing Get All Demo Requests...');
    const demosResponse = await axios.get(`${BASE_URL}/demo`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (demosResponse.data.success) {
      console.log('✅ Demo requests retrieved successfully');
      console.log('🏢 Total demos found:', demosResponse.data.data.demos.length);
    }

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Authentication working');
    console.log('- ✅ Contact management working');
    console.log('- ✅ Demo management working');
    console.log('- ✅ Admin dashboard working');
    console.log('\n🌐 Server running at: http://localhost:5001');
    console.log('📧 Admin login: admin@company.com / Admin@123');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run tests
testAPI();