const axios = require('axios');

// Test script to verify admin authentication
async function testAdminAuth() {
  try {
    console.log('Testing admin endpoints...\n');

    // First, try to login as admin
    console.log('1. Attempting admin login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@medichat.com',
      password: 'admin123'
    });

    const { token, user } = loginResponse.data;
    console.log('✓ Login successful');
    console.log('User:', JSON.stringify(user, null, 2));
    console.log('Token:', token.substring(0, 20) + '...\n');

    // Now test admin endpoints with the token
    console.log('2. Testing /api/admin/users endpoint...');
    const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✓ Users endpoint works');
    console.log(`Found ${usersResponse.data.users?.length || 0} users\n`);

    console.log('3. Testing /api/admin/logs/activities endpoint...');
    const logsResponse = await axios.get('http://localhost:5000/api/admin/logs/activities?page=1&limit=50', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✓ Logs endpoint works');
    console.log(`Found ${logsResponse.data.logs?.length || 0} logs\n`);

    console.log('3. Testing /api/admin/logs/statistics endpoint...');
    const statsResponse = await axios.get('http://localhost:5000/api/admin/logs/statistics?startDate=2025-09-28&endDate=2025-10-28', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✓ Statistics endpoint works');
    console.log('Stats:', JSON.stringify(statsResponse.data, null, 2));

    console.log('\n✅ All admin endpoints working correctly!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAdminAuth();
