const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Invitation = require('./models/Invitation');
const Tag = require('./models/Tag');
const { testConnection, executeQuery } = require('./models/database');

/**
 * Test Script to verify all models work with the existing database
 */

async function testDatabaseIntegration() {
  console.log('🧪 Testing SynergySphere Database Integration...\n');
  
  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    console.log('   ✅ Database connection successful\n');
    
    // 2. Verify all tables exist
    console.log('2. Verifying table structure...');
    await verifyTableStructure();
    console.log('   ✅ All tables exist\n');
    
    // 3. Test User model
    console.log('3. Testing User model...');
    await testUserModel();
    console.log('   ✅ User model working correctly\n');
    
    // 4. Test Tag model (insert default tags if not exists)
    console.log('4. Testing Tag model...');
    await testTagModel();
    console.log('   ✅ Tag model working correctly\n');
    
    // 5. Test Project model
    console.log('5. Testing Project model...');
    await testProjectModel();
    console.log('   ✅ Project model working correctly\n');
    
    // 6. Test Task model
    console.log('6. Testing Task model...');
    await testTaskModel();
    console.log('   ✅ Task model working correctly\n');
    
    // 7. Test Invitation model
    console.log('7. Testing Invitation model...');
    await testInvitationModel();
    console.log('   ✅ Invitation model working correctly\n');
    
    console.log('🎉 All tests passed! Your database is ready to use.');
    
    // Show final stats
    console.log('\n📊 Final Database Stats:');
    const stats = await getDatabaseStats();
    console.log(stats);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function verifyTableStructure() {
  const requiredTables = [
    'Users', 'Projects', 'Tasks', 'ProjectTaskUser', 
    'Invitations', 'Tags', 'ProjectTagLinks', 'TaskTagLinks'
  ];
  
  const result = await executeQuery('SHOW TABLES');
  const existingTables = result.data.map(row => Object.values(row)[0]);
  
  for (const table of requiredTables) {
    if (!existingTables.includes(table)) {
      throw new Error(`Missing table: ${table}`);
    }
    console.log(`   ✓ ${table} table exists`);
  }
}

async function testUserModel() {
  // Test user creation
  const testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  if (!testUser) {
    throw new Error('Failed to create user');
  }
  
  console.log(`   ✓ User created with ID: ${testUser.user_id}`);
  
  // Test user retrieval
  const retrievedUser = await User.findById(testUser.user_id);
  if (!retrievedUser || retrievedUser.email !== 'test@example.com') {
    throw new Error('Failed to retrieve user');
  }
  
  console.log(`   ✓ User retrieved successfully`);
  
  // Test user update
  const updatedUser = await User.update(testUser.user_id, {
    name: 'Updated Test User'
  });
  
  if (!updatedUser || updatedUser.name !== 'Updated Test User') {
    throw new Error('Failed to update user');
  }
  
  console.log(`   ✓ User updated successfully`);
  
  // Store the test user ID for other tests
  global.testUserId = testUser.user_id;
}

async function testTagModel() {
  // Check if default tags exist, if not create them
  const existingTags = await Tag.getAll(5, 0);
  
  if (existingTags.length === 0) {
    console.log('   → Inserting default tags...');
    const defaultTags = [
      { tag_name: 'Frontend', tag_type: 'project' },
      { tag_name: 'Backend', tag_type: 'project' },
      { tag_name: 'Bug Fix', tag_type: 'task' },
      { tag_name: 'Feature', tag_type: 'task' }
    ];
    
    for (const tagData of defaultTags) {
      await Tag.create(tagData);
    }
    console.log(`   ✓ Inserted ${defaultTags.length} default tags`);
  } else {
    console.log(`   ✓ Found ${existingTags.length} existing tags`);
  }
  
  // Test tag search
  const projectTags = await Tag.getByType('project');
  console.log(`   ✓ Found ${projectTags.length} project tags`);
}

async function testProjectModel() {
  if (!global.testUserId) {
    throw new Error('Test user not created');
  }
  
  // Create a test project
  const projectData = {
    owner_id: global.testUserId,
    manager_id: global.testUserId,
    name: 'Test Project',
    start_time: new Date(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    priority: 'medium',
    status: 'waiting',
    description: 'This is a test project'
  };
  
  const insertQuery = `
    INSERT INTO Projects (owner_id, manager_id, name, start_time, deadline, priority, status, description) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const result = await executeQuery(insertQuery, [
    projectData.owner_id, projectData.manager_id, projectData.name,
    projectData.start_time, projectData.deadline, projectData.priority,
    projectData.status, projectData.description
  ]);
  
  if (!result.success) {
    throw new Error('Failed to create project');
  }
  
  console.log(`   ✓ Project created with ID: ${result.data.insertId}`);
  global.testProjectId = result.data.insertId;
}

async function testTaskModel() {
  if (!global.testProjectId) {
    throw new Error('Test project not created');
  }
  
  // Create a test task
  const taskData = {
    name: 'Test Task',
    start_time: new Date(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'progress',
    description: 'This is a test task'
  };
  
  const insertQuery = `
    INSERT INTO Tasks (name, start_time, deadline, status, description) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const result = await executeQuery(insertQuery, [
    taskData.name, taskData.start_time, taskData.deadline,
    taskData.status, taskData.description
  ]);
  
  if (!result.success) {
    throw new Error('Failed to create task');
  }
  
  console.log(`   ✓ Task created with ID: ${result.data.insertId}`);
  
  // Link task to project and user
  const linkQuery = `
    INSERT INTO ProjectTaskUser (project_id, task_id, user_id, role) 
    VALUES (?, ?, ?, ?)
  `;
  
  const linkResult = await executeQuery(linkQuery, [
    global.testProjectId, result.data.insertId, global.testUserId, 'owner'
  ]);
  
  if (!linkResult.success) {
    throw new Error('Failed to link task to project');
  }
  
  console.log(`   ✓ Task linked to project and user`);
  global.testTaskId = result.data.insertId;
}

async function testInvitationModel() {
  if (!global.testUserId || !global.testProjectId) {
    throw new Error('Test user or project not created');
  }
  
  // Create another test user for invitation
  const testUser2 = await User.create({
    name: 'Test User 2',
    email: 'test2@example.com',
    password: 'testpassword123'
  });
  
  if (!testUser2) {
    throw new Error('Failed to create second test user');
  }
  
  console.log(`   ✓ Second user created with ID: ${testUser2.user_id}`);
  
  // Test invitation creation
  const invitation = await Invitation.create({
    user_id_from: global.testUserId,
    user_id_to: testUser2.user_id,
    project_id: global.testProjectId
  });
  
  if (!invitation) {
    throw new Error('Failed to create invitation');
  }
  
  console.log(`   ✓ Invitation created with ID: ${invitation.invitation_id}`);
  
  // Test invitation retrieval
  const invitations = await Invitation.getForUser(testUser2.user_id, 'received');
  if (invitations.length === 0) {
    throw new Error('Failed to retrieve invitations');
  }
  
  console.log(`   ✓ Found ${invitations.length} invitation(s) for user`);
}

async function getDatabaseStats() {
  const queries = [
    'SELECT COUNT(*) as count FROM Users',
    'SELECT COUNT(*) as count FROM Projects',
    'SELECT COUNT(*) as count FROM Tasks',
    'SELECT COUNT(*) as count FROM Invitations',
    'SELECT COUNT(*) as count FROM Tags',
    'SELECT COUNT(*) as count FROM ProjectTaskUser'
  ];
  
  const tableNames = ['Users', 'Projects', 'Tasks', 'Invitations', 'Tags', 'ProjectTaskUser'];
  const stats = {};
  
  for (let i = 0; i < queries.length; i++) {
    const result = await executeQuery(queries[i]);
    if (result.success) {
      stats[tableNames[i]] = result.data[0].count;
    }
  }
  
  return stats;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseIntegration().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testDatabaseIntegration,
  verifyTableStructure,
  testUserModel,
  testTagModel,
  testProjectModel,
  testTaskModel,
  testInvitationModel
};
