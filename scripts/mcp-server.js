#!/usr/bin/env node

// This script starts the MCP server
// It needs to be compiled from TypeScript first

const { spawn } = require('child_process');
const path = require('path');

// Compile TypeScript first
console.log('Compiling MCP server...');
const tsc = spawn('npx', ['tsc', 'src/lib/mcp-server.ts', '--outDir', 'dist', '--module', 'esnext', '--target', 'es2020', '--moduleResolution', 'node'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

tsc.on('close', (code) => {
  if (code !== 0) {
    console.error('TypeScript compilation failed');
    process.exit(1);
  }
  
  console.log('Starting MCP server...');
  
  // Run the compiled server
  const server = spawn('node', ['dist/lib/mcp-server.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  server.on('error', (err) => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    console.log(`MCP server exited with code ${code}`);
  });
});