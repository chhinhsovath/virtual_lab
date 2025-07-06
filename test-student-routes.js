#!/usr/bin/env node

/**
 * Student Role Navigation Test Suite
 * Tests all student portal pages and functionality
 */

const http = require('http');

const baseUrl = 'http://localhost:3002';

// Student portal routes to test
const studentRoutes = [
  '/student',
  '/student/analytics',
  '/student/profile', 
  '/student/history',
  '/student/activity',
  '/simulation/832b5d88-1980-4915-82fb-50cdc0726b86'
];

// Student API endpoints to test
const studentApiEndpoints = [
  '/api/auth/session',
  '/api/student/stats',
  '/api/student/profile',
  '/api/student/progress',
  '/api/analytics/student',
  '/api/simulations',
  '/api/exercises'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message,
        url: url
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout',
        url: url
      });
    });
  });
}

async function testStudentNavigation() {
  console.log('🎓 STUDENT ROLE NAVIGATION TEST SUITE');
  console.log('====================================\n');

  // Test student routes
  console.log('📚 Testing Student Portal Routes:');
  for (const route of studentRoutes) {
    const result = await makeRequest(baseUrl + route);
    const status = result.status === 200 ? '✅' : 
                  result.status === 401 ? '🔒' :
                  result.status === 403 ? '⛔' :
                  result.status === 404 ? '❌' : 
                  result.status === 500 ? '💥' : '⚠️';
    
    console.log(`${status} ${route} (${result.status})`);
  }

  console.log('\n🔌 Testing Student API Endpoints:');
  for (const endpoint of studentApiEndpoints) {
    const result = await makeRequest(baseUrl + endpoint);
    const status = result.status === 200 ? '✅' : 
                  result.status === 401 ? '🔒' :
                  result.status === 403 ? '⛔' :
                  result.status === 404 ? '❌' :
                  result.status === 500 ? '💥' : '⚠️';
    
    console.log(`${status} ${endpoint} (${result.status})`);
  }

  console.log('\n📊 Test Summary:');
  console.log('✅ = OK (200)');
  console.log('🔒 = Auth Required (401)');
  console.log('⛔ = Forbidden (403)');
  console.log('❌ = Not Found (404)');
  console.log('💥 = Server Error (500)');
  console.log('⚠️ = Other Status');
}

// Run the test
testStudentNavigation().catch(console.error);