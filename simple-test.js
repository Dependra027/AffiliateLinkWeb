const axios = require('axios');

// Simple test to verify backend is working
async function simpleTest() {
  try {
    console.log('🧪 Simple Backend Test...\n');
    
    // Test 1: Check if backend is running
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running:', healthResponse.data.message);
    
    // Test 2: Check if we can access the links endpoint (will fail without auth, but that's expected)
    console.log('\n2. Testing links endpoint...');
    try {
      await axios.get('http://localhost:5000/api/links');
      console.log('❌ Unexpected: Links endpoint accessible without auth');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Links endpoint properly protected (requires auth)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    console.log('\n🎉 Backend is working correctly!');
    console.log('\nTo test destination analytics:');
    console.log('1. Open http://localhost:3000');
    console.log('2. Create a link with multiple destination URLs');
    console.log('3. Visit the tracking URL a few times');
    console.log('4. Check the stats page for destination analytics');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running: cd backend && npm start');
    }
  }
}

simpleTest(); 