#!/usr/bin/env node

/**
 * Quick Start Script for Certificate Generator
 * Helps users set up the project quickly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎓 Certificate Generator - Quick Start\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Creating from template...');
    const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Created .env file\n');
    console.log('📝 Please update VITE_N8N_WEBHOOK_URL in .env with your n8n URL\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...\n');
    execSync('npm install', { stdio: 'inherit' });
    console.log('\n✅ Dependencies installed\n');
}

console.log('🚀 Starting development server...\n');
console.log('📖 Documentation:');
console.log('   - README.md - Full project documentation');
console.log('   - N8N_WORKFLOW_GUIDE.md - n8n setup guide\n');
console.log('🌐 Frontend will be available at: http://localhost:5173\n');
console.log('⚙️  Make sure your n8n server is running!\n');

// Start dev server
execSync('npm run dev', { stdio: 'inherit' });
