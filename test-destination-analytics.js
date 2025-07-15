const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test destination analytics functionality
async function testDestinationAnalytics() {
  try {
    console.log('🧪 Testing Destination Analytics...\n');

    // 1. Try to login, if fails, register a new user
    console.log('1. Attempting login...');
    let token;
    let authHeader;
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      token = loginResponse.data.token;
      console.log('✅ Login successful\n');
    } catch (loginError) {
      console.log('❌ Login failed, registering new user...');
      
      // Register a new user
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      
      token = registerResponse.data.token;
      console.log('✅ Registration successful\n');
    }
    
    authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Create a test link with multiple destinations (A/B test)
    console.log('2. Creating A/B test link...');
    const createLinkResponse = await axios.post(`${BASE_URL}/links`, {
      title: 'A/B Test Link',
      description: 'Testing destination analytics',
      destinations: [
        'https://example.com/variant-a',
        'https://example.com/variant-b',
        'https://example.com/variant-c'
      ],
      tags: ['test', 'ab-test']
    }, authHeader);
    
    const link = createLinkResponse.data;
    const trackingId = link.trackingId;
    console.log(`✅ Link created with tracking ID: ${trackingId}`);
    console.log(`   Destinations: ${link.destinations.length}`);
    console.log(`   Destination Analytics initialized: ${link.destinationAnalytics ? 'Yes' : 'No'}\n`);

    // 3. Simulate clicks to different destinations
    console.log('3. Simulating clicks...');
    const clickPromises = [];
    
    // Simulate 10 clicks with different referrers to test platform detection
    const platforms = ['facebook', 'twitter', 'instagram', 'whatsapp', 'direct'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0'
    ];

    for (let i = 0; i < 10; i++) {
      const platform = platforms[i % platforms.length];
      const userAgent = userAgents[i % userAgents.length];
      
      // Simulate click with different referrers
      const referrer = platform === 'direct' ? '' : `https://${platform}.com/some-post`;
      
      clickPromises.push(
        axios.get(`${BASE_URL}/links/t/${trackingId}`, {
          headers: {
            'User-Agent': userAgent,
            'Referer': referrer,
            'X-Forwarded-For': `192.168.1.${i + 1}`
          },
          maxRedirects: 0,
          validateStatus: (status) => status === 302 // Expect redirect
        }).catch(err => {
          // We expect a redirect, so 302 is success
          if (err.response && err.response.status === 302) {
            return { status: 302, destination: err.response.headers.location };
          }
          throw err;
        })
      );
    }

    const clickResults = await Promise.all(clickPromises);
    console.log(`✅ Simulated ${clickResults.length} clicks\n`);

    // 4. Wait a moment for analytics to be processed
    console.log('4. Waiting for analytics processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Fetch analytics to verify destination analytics
    console.log('5. Fetching analytics...');
    const analyticsResponse = await axios.get(`${BASE_URL}/links/${link._id}/analytics`, authHeader);
    const analytics = analyticsResponse.data;
    
    console.log(`✅ Analytics fetched successfully`);
    console.log(`   Total clicks: ${analytics.totalClicks}`);
    console.log(`   Destination stats: ${analytics.destinationStats ? analytics.destinationStats.length : 0} destinations`);
    console.log(`   Raw destinationStats:`, JSON.stringify(analytics.destinationStats, null, 2));
    
    if (analytics.destinationStats) {
      analytics.destinationStats.forEach((dest, index) => {
        console.log(`   Destination ${index + 1}: ${dest.totalClicks} clicks (${dest.url})`);
        console.log(`     Platforms: ${Object.keys(dest.platformStats).filter(p => dest.platformStats[p].clicks > 0).join(', ')}`);
      });
    } else {
      console.log('   ❌ No destinationStats found in response');
    }

    // 6. Verify the data structure
    console.log('\n6. Verifying data structure...');
    if (analytics.destinationStats && analytics.destinationStats.length > 0) {
      const firstDest = analytics.destinationStats[0];
      const hasRequiredFields = firstDest.url && 
                               typeof firstDest.totalClicks === 'number' &&
                               firstDest.platformStats &&
                               firstDest.deviceCounts &&
                               firstDest.browserCounts;
      
      console.log(`✅ Destination analytics structure: ${hasRequiredFields ? 'Valid' : 'Invalid'}`);
    } else {
      console.log('❌ No destination analytics found');
    }

    console.log('\n🎉 Destination Analytics Test Complete!');
    console.log('\nTo view the results:');
    console.log(`1. Open http://localhost:3000`);
    console.log(`2. Login with test@example.com/password123`);
    console.log(`3. Go to the stats page for "A/B Test Link"`);
    console.log(`4. Look for the "Destination Analytics (A/B Testing)" section`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDestinationAnalytics(); 