const fetch = require('node-fetch');

async function testParentLogin() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing parent login and data access...\n');
    
    // 1. Login as parent
    console.log('1. Logging in as parent...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'parent@vlab.edu.kh',
        password: 'demo123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('   User:', loginData.user.name);
    console.log('   Role:', loginData.user.role);
    console.log('   Roles:', loginData.user.roles);
    
    // Get session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    const sessionCookie = cookies ? cookies.split(';')[0] : '';
    
    // 2. Check session
    console.log('\n2. Checking session...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { 'Cookie': sessionCookie }
    });
    
    const sessionData = await sessionResponse.json();
    
    if (!sessionResponse.ok) {
      console.log('❌ Session check failed:', sessionData);
      return;
    }
    
    console.log('✅ Session valid!');
    console.log('   User ID:', sessionData.user.id);
    console.log('   Role:', sessionData.user.role);
    console.log('   Name:', sessionData.user.name);
    
    // 3. Get parent's children
    console.log('\n3. Fetching parent\'s children...');
    const childrenResponse = await fetch(`${baseUrl}/api/parent/children`, {
      headers: { 'Cookie': sessionCookie }
    });
    
    const childrenData = await childrenResponse.json();
    
    if (!childrenResponse.ok) {
      console.log('❌ Failed to fetch children:', childrenData);
      return;
    }
    
    console.log('✅ Children fetched successfully!');
    if (childrenData.children && childrenData.children.length > 0) {
      childrenData.children.forEach(child => {
        console.log(`\n   Child: ${child.firstName} ${child.lastName}`);
        console.log(`   Grade: ${child.grade}`);
        console.log(`   GPA: ${child.overallGPA}`);
        console.log(`   Enrolled Labs: ${child.enrolledCourses}`);
        console.log(`   Pending Work: ${child.pendingAssignments}`);
      });
    } else {
      console.log('   No children found');
    }
    
    console.log('\n🎉 Test complete! Parent portal should be working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testParentLogin();