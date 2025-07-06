#!/usr/bin/env node

/**
 * Teacher Role Navigation Test Suite
 * Tests all teacher dashboard pages and functionality
 */

const http = require('http');
const https = require('https');

const baseUrl = 'http://localhost:3000';

// Teacher dashboard routes to test
const teacherRoutes = [
  '/dashboard',
  '/dashboard/assessment-entry',
  '/dashboard/analytics', 
  '/dashboard/students',
  '/dashboard/simulations',
  '/dashboard/assignments',
  '/dashboard/results',
  '/dashboard/exercises',
  '/dashboard/student-selection'
];

// API endpoints to test
const apiEndpoints = [
  '/api/auth/session',
  '/api/students/1',
  '/api/assessments',
  '/api/simulations',
  '/api/analytics/student',
  '/api/exercises',
  '/api/assignments'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      timeout: 5000,
      headers: {
        'User-Agent': 'Teacher-Navigation-Test/1.0'
      }
    };

    const req = client.get(url, options, (res) => {
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

async function testTeacherNavigation() {
  console.log('🚀 TEACHER ROLE NAVIGATION TEST SUITE');
  console.log('=====================================\n');

  // Test dashboard routes
  console.log('📋 Testing Dashboard Routes:');
  for (const route of teacherRoutes) {
    const result = await makeRequest(baseUrl + route);
    const status = result.status === 200 ? '✅' : 
                  result.status === 401 ? '🔒' :
                  result.status === 403 ? '⛔' :
                  result.status === 404 ? '❌' : '⚠️';
    
    console.log(`${status} ${route} (${result.status})`);
  }

  console.log('\n🔌 Testing API Endpoints:');
  for (const endpoint of apiEndpoints) {
    const result = await makeRequest(baseUrl + endpoint);
    const status = result.status === 200 ? '✅' : 
                  result.status === 401 ? '🔒' :
                  result.status === 403 ? '⛔' :
                  result.status === 404 ? '❌' : '⚠️';
    
    console.log(`${status} ${endpoint} (${result.status})`);
  }

  console.log('\n📊 Test Summary:');
  console.log('✅ = OK (200)');
  console.log('🔒 = Auth Required (401)');
  console.log('⛔ = Forbidden (403)');
  console.log('❌ = Not Found (404)');
  console.log('⚠️ = Other Status');
}

// Run the test
testTeacherNavigation().catch(console.error);