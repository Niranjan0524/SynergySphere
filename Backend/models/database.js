const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Database connection pool configuration
 */
const dbConfig = {
  host: process.env.HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '',
  database: process.env.DATABASE || 'synergyphere',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

/**
 * Execute a query with parameters
 */
const executeQuery = async (query, params = []) => {
  try {
    const [rows, fields] = await pool.execute(query, params);
    return { success: true, data: rows, fields };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Execute a transaction
 */
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
  try {
    const queries = [
      'SELECT COUNT(*) as user_count FROM Users',
      'SELECT COUNT(*) as project_count FROM Projects',
      'SELECT COUNT(*) as task_count FROM Tasks',
      'SELECT COUNT(*) as invitation_count FROM Invitations',
      'SELECT COUNT(*) as tag_count FROM Tags'
    ];

    const results = {};
    for (const query of queries) {
      const { data } = await executeQuery(query);
      const key = query.match(/as (\w+)/)[1];
      results[key] = data[0][key];
    }

    return results;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

/**
 * Verify database structure (check if required tables exist)
 */
const verifyDatabaseStructure = async () => {
  try {
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
    const { data: tables } = await executeQuery('SHOW TABLES');
    
    const existingTables = tables.map(row => Object.values(row)[0]);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.warn(`⚠️ Missing tables: ${missingTables.join(', ')}`);
      return false;
    }
    
    console.log('✅ All required tables exist in database');
    return true;
  } catch (error) {
    console.error('Error verifying database structure:', error);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction,
  getDatabaseStats,
  verifyDatabaseStructure
};
