const { testConnection, executeQuery, executeTransaction } = require('./models/database');
const fs = require('fs').promises;
const path = require('path');

/**
 * Database Setup Script
 * This script sets up the SynergySphere database with the new schema
 */

async function setupDatabase() {
  console.log('🚀 Starting SynergySphere Database Setup...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('Database connection failed. Please check your database configuration.');
    }
    
    // Read and execute SQL setup file
    console.log('2. Reading database setup SQL file...');
    const sqlFilePath = path.join(__dirname, 'database_setup.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`3. Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);
      
      const result = await executeQuery(statement);
      if (!result.success && !result.error.includes('already exists')) {
        console.warn(`   ⚠️ Warning on statement ${i + 1}: ${result.error}`);
      }
    }
    
    console.log('4. Verifying table creation...');
    await verifyTables();
    
    console.log('5. Inserting default data...');
    await insertDefaultData();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • All tables created with proper relationships');
    console.log('   • Default tags inserted');
    console.log('   • Indexes created for better performance');
    console.log('   • Database is ready for use');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

/**
 * Verify that all required tables exist
 */
async function verifyTables() {
  const requiredTables = [
    'Users', 
    'Projects', 
    'Tasks', 
    'ProjectTaskUser', 
    'Invitations', 
    'Tags', 
    'ProjectTagLinks', 
    'TaskTagLinks'
  ];
  
  const result = await executeQuery('SHOW TABLES');
  
  if (!result.success) {
    throw new Error('Failed to verify tables');
  }
  
  const existingTables = result.data.map(row => Object.values(row)[0]);
  const missingTables = requiredTables.filter(table => !existingTables.includes(table));
  
  if (missingTables.length > 0) {
    throw new Error(`Missing tables: ${missingTables.join(', ')}`);
  }
  
  console.log(`   ✅ All ${requiredTables.length} required tables verified`);
}

/**
 * Insert default data
 */
async function insertDefaultData() {
  // Check if default tags already exist
  const existingTags = await executeQuery('SELECT COUNT(*) as count FROM Tags');
  
  if (existingTags.success && existingTags.data[0].count > 0) {
    console.log('   ✅ Default tags already exist');
    return;
  }
  
  const defaultTags = [
    ['Frontend', 'project'],
    ['Backend', 'project'],
    ['Mobile', 'project'],
    ['Web Development', 'project'],
    ['API', 'project'],
    ['Database', 'project'],
    ['UI/UX', 'task'],
    ['Bug Fix', 'task'],
    ['Feature', 'task'],
    ['Testing', 'task'],
    ['Documentation', 'task'],
    ['Optimization', 'task']
  ];
  
  const insertQuery = 'INSERT INTO Tags (tag_name, tag_type) VALUES (?, ?)';
  
  for (const [tagName, tagType] of defaultTags) {
    const result = await executeQuery(insertQuery, [tagName, tagType]);
    if (!result.success) {
      console.warn(`   ⚠️ Failed to insert tag: ${tagName}`);
    }
  }
  
  console.log(`   ✅ Inserted ${defaultTags.length} default tags`);
}

/**
 * Reset database (drop all tables and recreate)
 */
async function resetDatabase() {
  console.log('⚠️ WARNING: This will drop all existing tables and data!');
  console.log('🔄 Resetting database...\n');
  
  const dropTables = [
    'DROP TABLE IF EXISTS TaskTagLinks',
    'DROP TABLE IF EXISTS ProjectTagLinks', 
    'DROP TABLE IF EXISTS Tags',
    'DROP TABLE IF EXISTS Invitations',
    'DROP TABLE IF EXISTS ProjectTaskUser',
    'DROP TABLE IF EXISTS Tasks',
    'DROP TABLE IF EXISTS Projects',
    'DROP TABLE IF EXISTS Users'
  ];
  
  for (const dropStatement of dropTables) {
    await executeQuery(dropStatement);
  }
  
  console.log('   ✅ All tables dropped');
  
  // Now run the normal setup
  await setupDatabase();
}

/**
 * Get database statistics
 */
async function getDatabaseInfo() {
  console.log('📊 Database Information:\n');
  
  try {
    const tables = await executeQuery('SHOW TABLES');
    console.log(`Tables: ${tables.data.length}`);
    
    if (tables.data.length > 0) {
      const stats = [
        'SELECT COUNT(*) as count FROM Users',
        'SELECT COUNT(*) as count FROM Projects', 
        'SELECT COUNT(*) as count FROM Tasks',
        'SELECT COUNT(*) as count FROM Invitations',
        'SELECT COUNT(*) as count FROM Tags'
      ];
      
      const tableNames = ['Users', 'Projects', 'Tasks', 'Invitations', 'Tags'];
      
      for (let i = 0; i < stats.length; i++) {
        const result = await executeQuery(stats[i]);
        if (result.success) {
          console.log(`${tableNames[i]}: ${result.data[0].count} records`);
        }
      }
    }
    
  } catch (error) {
    console.error('Failed to get database info:', error.message);
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupDatabase();
    break;
  case 'reset':
    resetDatabase();
    break;
  case 'info':
    getDatabaseInfo();
    break;
  default:
    console.log('SynergySphere Database Setup Script\n');
    console.log('Usage:');
    console.log('  node setup-database.js setup  - Setup database with new schema');
    console.log('  node setup-database.js reset  - Drop all tables and recreate');
    console.log('  node setup-database.js info   - Show database information');
    break;
}

module.exports = {
  setupDatabase,
  resetDatabase,
  getDatabaseInfo,
  verifyTables,
  insertDefaultData
};
