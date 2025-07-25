#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐕 Setting up WSD Care Tracker...\n');

// Function to run commands and handle errors
function runCommand(command, description) {
  console.log(`⏳ ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ Failed to ${description.toLowerCase()}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Check if Node.js version is compatible
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required');
    console.error(`Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version ${nodeVersion} is compatible\n`);
}

// Create necessary directories
function createDirectories() {
  const dirs = [
    'server/uploads',
    'client/build'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  console.log('');
}

// Main setup function
async function setup() {
  try {
    // Check Node.js version
    checkNodeVersion();
    
    // Create necessary directories
    createDirectories();
    
    // Install root dependencies
    runCommand('npm install', 'Installing root dependencies');
    
    // Install server dependencies
    runCommand('cd server && npm install', 'Installing server dependencies');
    
    // Install client dependencies
    runCommand('cd client && npm install', 'Installing client dependencies');
    
    // Initialize database and seed data
    runCommand('cd server && node seed-data.js', 'Initializing database and seeding sample data');
    
    console.log('🎉 Setup completed successfully!\n');
    console.log('🚀 To start the application:');
    console.log('   npm run dev\n');
    console.log('📱 The app will be available at:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:5000\n');
    console.log('📊 Sample data includes:');
    console.log('   • 5 volunteers with contact information');
    console.log('   • 8 dogs with health and behavior notes');
    console.log('   • Default tasks (Walk, Bath, Feeding) for all dogs\n');
    console.log('💡 Check the README.md for detailed usage instructions.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setup();