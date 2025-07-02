const axios = require('axios');

// Test your deployed API endpoints
const testAPI = async () => {
  const baseURL = 'https://your-vercel-domain.vercel.app/api'; // Replace with your actual domain
  
  console.log('Testing API endpoints...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test login endpoint (should fail with invalid credentials)
    console.log('\n2. Testing login endpoint...');
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Login should have failed but succeeded:', loginResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Login endpoint working (correctly rejected invalid credentials)');
      } else {
        console.log('❌ Login endpoint error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test register endpoint (should fail with invalid data)
    console.log('\n3. Testing register endpoint...');
    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        username: 'test',
        email: 'invalid-email',
        password: '123'
      });
      console.log('❌ Register should have failed but succeeded:', registerResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Register endpoint working (correctly rejected invalid data)');
      } else {
        console.log('❌ Register endpoint error:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Run the test
testAPI(); 