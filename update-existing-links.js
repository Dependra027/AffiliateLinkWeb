const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Update existing links to support A/B testing
async function updateExistingLinks() {
  try {
    console.log('🔄 Updating existing links for A/B testing support...\n');

    // 1. Login to get auth token
    console.log('1. Logging in...');
    let token;
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'your-email@example.com', // Replace with your email
        password: 'your-password' // Replace with your password
      });
      token = loginResponse.data.token;
      console.log('✅ Login successful\n');
    } catch (loginError) {
      console.log('❌ Login failed. Please update the email and password in the script.');
      return;
    }
    
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Get all existing links
    console.log('2. Fetching existing links...');
    const linksResponse = await axios.get(`${BASE_URL}/links`, authHeader);
    const links = linksResponse.data;
    console.log(`✅ Found ${links.length} existing links\n`);

    // 3. Update each link to support A/B testing
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      console.log(`3.${i + 1} Updating link: "${link.title}"`);
      
      // Check if link already has destinationAnalytics
      if (link.destinationAnalytics && link.destinationAnalytics.length > 0) {
        console.log(`   ✅ Already has destination analytics`);
        continue;
      }

      // Initialize destinationAnalytics for this link
      const destinations = link.destinations && link.destinations.length > 0 
        ? link.destinations 
        : [link.url]; // Use the main URL if no destinations

      const destinationAnalytics = destinations.map(dest => ({
        url: dest,
        analytics: [],
        platformAnalytics: {
          facebook: [],
          twitter: [],
          instagram: [],
          whatsapp: [],
          linkedin: [],
          tiktok: [],
          youtube: [],
          telegram: [],
          email: [],
          direct: [],
          other: []
        }
      }));

      // Update the link
      try {
        const updateResponse = await axios.put(`${BASE_URL}/links/${link._id}`, {
          title: link.title,
          url: link.url,
          description: link.description,
          tags: link.tags,
          destinations: destinations,
          destinationAnalytics: destinationAnalytics
        }, authHeader);
        
        console.log(`   ✅ Updated successfully`);
      } catch (updateError) {
        console.log(`   ❌ Update failed:`, updateError.response?.data?.message || updateError.message);
      }
    }

    console.log('\n🎉 Update complete!');
    console.log('\nNow you can:');
    console.log('1. Go to your dashboard');
    console.log('2. Edit any link to add multiple destinations');
    console.log('3. View destination analytics in the stats page');

  } catch (error) {
    console.error('❌ Update failed:', error.response?.data || error.message);
  }
}

// Instructions for the user
console.log('📝 Instructions:');
console.log('1. Update the email and password in this script (lines 15-16)');
console.log('2. Run: node update-existing-links.js');
console.log('3. This will update your existing links to support A/B testing\n');

updateExistingLinks(); 