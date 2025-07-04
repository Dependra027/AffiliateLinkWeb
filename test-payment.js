const axios = require('axios');

// Test payment endpoints
const testPayment = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Payment System...\n');
  
  try {
    // Test 1: Get packages
    console.log('1. Testing packages endpoint...');
    const packagesResponse = await axios.get(`${baseURL}/payments/packages`);
    console.log('✅ Packages loaded:', packagesResponse.data.packages);
    
    // Test 2: Test health endpoint
    console.log('\n2. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Server health:', healthResponse.data);
    
    // Test 3: Test database connection
    console.log('\n3. Testing database connection...');
    const dbResponse = await axios.get(`${baseURL}/test-db`);
    console.log('✅ Database:', dbResponse.data);
    
    console.log('\n🎉 All basic tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Open your app in the browser');
    console.log('2. Login to your account');
    console.log('3. Go to the payment page');
    console.log('4. Open browser developer tools (F12)');
    console.log('5. Try to purchase credits and check console for errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 The endpoints require authentication. This is expected.');
      console.log('Please test the payment flow in the browser while logged in.');
    }
  }
};

// Run the test
testPayment(); 