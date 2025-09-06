const { executeQuery } = require('./models/database');

async function testTables() {
  try {
    console.log('Testing database tables...\n');
    
    // Check what tables exist
    const showTablesQuery = 'SHOW TABLES';
    const tablesResult = await executeQuery(showTablesQuery);
    
    if (tablesResult.success) {
      console.log('Tables in database:', tablesResult.data);
    } else {
      console.log('Error checking tables:', tablesResult.error);
    }
    
    // Try to describe Users table
    try {
      const describeUsersQuery = 'DESCRIBE Users';
      const usersResult = await executeQuery(describeUsersQuery);
      
      if (usersResult.success) {
        console.log('\nUsers table structure:', usersResult.data);
      } else {
        console.log('\nUsers table does not exist or error:', usersResult.error);
      }
    } catch (error) {
      console.log('\nError describing Users table:', error.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testTables();
