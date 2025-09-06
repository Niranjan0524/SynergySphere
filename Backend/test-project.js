const { executeQuery } = require('./models/database');

async function testProjectAPI() {
  try {
    console.log('🧪 Testing Project API Implementation...\n');
    
    // 1. Test if Users table exists and has test data
    console.log('1. Checking Users table...');
    const usersQuery = 'SELECT user_id, name, email FROM Users LIMIT 5';
    const usersResult = await executeQuery(usersQuery);
    
    if (usersResult.success && usersResult.data.length > 0) {
      console.log('✅ Users found:', usersResult.data);
    } else {
      console.log('⚠️ No users found. Creating test users...');
      
      // Create test users
      const bcrypt = require('bcrypt');
      const testUsers = [
        { name: 'John Doe', email: 'john@example.com', password: 'password123' },
        { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' }
      ];
      
      for (const user of testUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const createUserQuery = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
        await executeQuery(createUserQuery, [user.name, user.email, hashedPassword]);
      }
      
      const newUsersResult = await executeQuery(usersQuery);
      console.log('✅ Test users created:', newUsersResult.data);
    }
    
    // 2. Test Projects table structure
    console.log('\n2. Checking Projects table structure...');
    const describeQuery = 'DESCRIBE Projects';
    const describeResult = await executeQuery(describeQuery);
    
    if (describeResult.success) {
      console.log('✅ Projects table structure:', describeResult.data);
    } else {
      console.log('⚠️ Projects table might not exist, will be created on first project creation');
    }
    
    // 3. Test ProjectTaskUser table structure
    console.log('\n3. Checking ProjectTaskUser table structure...');
    const describePTUQuery = 'DESCRIBE ProjectTaskUser';
    const describePTUResult = await executeQuery(describePTUQuery);
    
    if (describePTUResult.success) {
      console.log('✅ ProjectTaskUser table structure:', describePTUResult.data);
    } else {
      console.log('⚠️ ProjectTaskUser table might not exist, will be created on first project creation');
    }
    
    console.log('\n🎉 Test completed! Ready to test project creation API.');
    console.log('\nTest the API with:');
    console.log('POST http://localhost:5000/projects');
    console.log('Body:');
    console.log(`{
  "ownerID": 1,
  "managerID": 1,
  "name": "Test Project",
  "deadline": "2025-12-31T23:59:59.000Z",
  "priority": "high",
  "status": "waiting",
  "description": "This is a test project"
}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testProjectAPI();
