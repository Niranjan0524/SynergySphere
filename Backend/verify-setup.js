// Simple verification script to check if all models work
console.log('🧪 SynergySphere Database Verification\n');

// Test database connection
const { testConnection } = require('./models/database');

async function verify() {
  try {
    console.log('Testing database connection...');
    const connected = await testConnection();
    
    if (connected) {
      console.log('✅ Database connection successful!');
      
      // Test User model
      console.log('\nTesting User model...');
      const User = require('./models/User');
      console.log('✅ User model loaded successfully');
      
      // Test Project model
      console.log('\nTesting Project model...');
      const Project = require('./models/Project');
      console.log('✅ Project model loaded successfully');
      
      // Test Task model
      console.log('\nTesting Task model...');
      const Task = require('./models/Task');
      console.log('✅ Task model loaded successfully');
      
      // Test Invitation model
      console.log('\nTesting Invitation model...');
      const Invitation = require('./models/Invitation');
      console.log('✅ Invitation model loaded successfully');
      
      // Test Tag model
      console.log('\nTesting Tag model...');
      const Tag = require('./models/Tag');
      console.log('✅ Tag model loaded successfully');
      
      console.log('\n🎉 All models loaded successfully!');
      console.log('\nYour database setup is working correctly.');
      console.log('\nNext steps:');
      console.log('1. Start your backend server: npm run dev');
      console.log('2. Test API endpoints with your frontend');
      console.log('3. Create users, projects, and tasks through your application');
      
    } else {
      console.log('❌ Database connection failed');
      console.log('Please check your .env file and database configuration');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\nCommon issues:');
    console.log('- Check your .env file has correct database credentials');
    console.log('- Make sure MySQL server is running');
    console.log('- Verify the database name exists');
  }
}

verify();
