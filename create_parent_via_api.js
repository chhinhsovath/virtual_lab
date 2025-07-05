// Create demo parent user via API calls
// This bypasses direct database access by using the application's API

const baseUrl = 'http://localhost:3000'; // Adjust if different

async function createDemoParentViaAPI() {
  try {
    console.log('🔧 Setting up demo parent user via API...\n');
    
    // First, let's check if we can reach the API
    console.log('1. Testing API connectivity...');
    const healthCheck = await fetch(`${baseUrl}/api/auth/session`);
    if (!healthCheck.ok && healthCheck.status !== 401) {
      throw new Error(`Cannot connect to ${baseUrl}. Make sure the server is running.`);
    }
    console.log('✅ API is reachable\n');
    
    // Try to login as admin to create the parent user
    console.log('2. Attempting to login as admin...');
    const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin@vlab.edu.kh',
        password: 'demo123'
      })
    });
    
    if (adminLogin.ok) {
      console.log('✅ Admin login successful\n');
      
      // Get the session cookie for authenticated requests
      const cookies = adminLogin.headers.get('set-cookie');
      
      console.log('3. Checking if parent user already exists...');
      // Try to login as parent to check if user exists
      const parentCheck = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'parent@vlab.edu.kh',
          password: 'demo123'
        })
      });
      
      if (parentCheck.ok) {
        console.log('✅ Demo parent user already exists and working!\n');
        console.log('🎉 You can now login with:');
        console.log('   Email: parent@vlab.edu.kh');
        console.log('   Password: demo123');
        console.log('\n   Go to /auth/login and click the "Parent" demo button');
        return;
      }
      
      console.log('⚠️  Parent user does not exist or credentials are wrong');
      console.log('    You need to run the SQL setup script or create the user manually');
      
    } else {
      console.log('⚠️  Could not login as admin. Trying direct parent login...\n');
      
      // Try direct parent login
      console.log('3. Testing direct parent login...');
      const parentLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'parent@vlab.edu.kh',
          password: 'demo123'
        })
      });
      
      if (parentLogin.ok) {
        console.log('✅ Demo parent user exists and working!\n');
        console.log('🎉 You can now login with:');
        console.log('   Email: parent@vlab.edu.kh');
        console.log('   Password: demo123');
        console.log('\n   Go to /auth/login and click the "Parent" demo button');
      } else {
        const error = await parentLogin.text();
        console.log('❌ Parent login failed:', error);
        console.log('\n🔧 Next steps:');
        console.log('   1. Run the SQL setup: psql -d your_database -f setup_demo_parent.sql');
        console.log('   2. Or add the user manually to your database');
        console.log('   3. Make sure the database migrations have been run');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the development server is running (npm run dev)');
    console.log('   2. Check that the database is connected and running');
    console.log('   3. Run the SQL setup script: psql -d your_database -f setup_demo_parent.sql');
  }
}

// Run the setup
createDemoParentViaAPI();