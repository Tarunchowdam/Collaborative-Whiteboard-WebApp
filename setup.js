const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Collaborative Whiteboard Application...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'server', '.env');
const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/whiteboard
NODE_ENV=development
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created server/.env file');
} else {
  console.log('ℹ️  server/.env file already exists');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Set up MongoDB:');
console.log('   - Option A: Install MongoDB locally from mongodb.com');
console.log('   - Option B: Use MongoDB Atlas (cloud) - recommended');
console.log('     * Go to mongodb.com/atlas and create free account');
console.log('     * Create a cluster and get your connection string');
console.log('     * Update MONGODB_URI in server/.env file');
console.log('2. Run "npm run dev" to start both client and server');
console.log('3. Open http://localhost:5173 in your browser');
console.log('4. Enter a room code (6-8 alphanumeric characters) to start drawing!');
console.log('\n🎨 Features:');
console.log('- Real-time collaborative drawing');
console.log('- Live cursor tracking');
console.log('- Color selection and stroke width adjustment');
console.log('- Clear canvas functionality');
console.log('- Room-based collaboration'); 