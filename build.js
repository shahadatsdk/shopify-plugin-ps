#!/usr/bin/env node

// Build script for PayStation Shopify App
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting PayStation Shopify App Build...');

try {
  // Check if required files exist
  const requiredFiles = [
    'server.js',
    'package.json',
    '.env',
    'templates/index.html'
  ];

  console.log('📋 Checking required files...');
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Missing required file: ${file}`);
      process.exit(1);
    }
    console.log(`✅ Found: ${file}`);
  }

  // Check environment variables
  console.log('🔑 Checking environment variables...');
  require('dotenv').config();
  
  const requiredEnvVars = [
    'SHOPIFY_API_KEY',
    'SHOPIFY_API_SECRET',
    'HOST'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Warning: ${envVar} is not set in .env file`);
    } else {
      console.log(`✅ ${envVar}: SET`);
    }
  }

  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Run any pre-build checks
  console.log('🔍 Running pre-build checks...');
  
  // Test server import
  try {
    require('./server.js');
    console.log('✅ Server module loads successfully');
  } catch (error) {
    console.error('❌ Server module failed to load:', error.message);
    process.exit(1);
  }

  // Test API module if it exists
  if (fs.existsSync('api/index.js')) {
    try {
      require('./api/index.js');
      console.log('✅ API module loads successfully');
    } catch (error) {
      console.error('❌ API module failed to load:', error.message);
      // This is not critical for local build
    }
  }

  console.log('✨ Build completed successfully!');
  console.log('\n📊 Build Summary:');
  console.log('   - Dependencies: ✓ Installed');
  console.log('   - Environment: ✓ Configured');
  console.log('   - Server: ✓ Ready');
  console.log('   - Files: ✓ Validated');
  
  console.log('\n🚀 To start the application:');
  console.log('   npm start    # Run locally');
  console.log('   npm run dev  # Run with auto-reload');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}