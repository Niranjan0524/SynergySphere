const { executeQuery, executeTransaction } = require('./database');
const bcrypt = require('bcrypt');

/**
 * User Model - handles all user-related database operations
 */
class User {
  
  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = 'SELECT user_id, name, email, profile_image, created_at, updated_at FROM Users WHERE user_id = ?';
    const result = await executeQuery(query, [id]);
    
    if (result.success && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM Users WHERE email = ?';
    const result = await executeQuery(query, [email]);
    
    if (result.success && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    const { name, email, password } = userData;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO Users (name, email, password) 
      VALUES (?, ?, ?)
    `;
    
    const result = await executeQuery(query, [name, email, hashedPassword]);
    
    if (result.success) {
      return await User.findById(result.data.insertId);
    }
    return null;
  }

  /**
   * Update user information
   */
  static async update(id, updateData) {
    const allowedFields = ['name', 'email', 'profile_image'];
    const fields = [];
    const values = [];
    
    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      return null; // No valid fields to update
    }
    
    values.push(id); // Add ID for WHERE clause
    
    const query = `UPDATE Users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    const result = await executeQuery(query, values);
    
    if (result.success) {
      return await User.findById(id);
    }
    return null;
  }

  /**
   * Update user password
   */
  static async updatePassword(id, newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const query = 'UPDATE Users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?';
    const result = await executeQuery(query, [hashedPassword, id]);
    
    return result.success;
  }

  /**
   * Verify user password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login timestamp - Note: This field doesn't exist in new schema
   */
  static async updateLastLogin(id) {
    // This functionality is removed as last_login field doesn't exist in new schema
    // If needed, you can add a separate login_logs table or add the field back to Users table
    return { success: true, message: 'Last login tracking not implemented in current schema' };
  }

  /**
   * Search users by name or email
   */
  static async search(searchTerm, limit = 10, offset = 0) {
    const query = `
      SELECT user_id, name, email, profile_image 
      FROM Users 
      WHERE (name LIKE ? OR email LIKE ?)
      ORDER BY name ASC 
      LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await executeQuery(query, [searchPattern, searchPattern, limit, offset]);
    
    return result.success ? result.data : [];
  }

  /**
   * Get all users
   */
  static async getAll(limit = 50, offset = 0, filters = {}) {
    let query = 'SELECT user_id, name, email, profile_image, created_at FROM Users';
    const queryParams = [];
    const conditions = [];
    
    // Add filters
    if (filters.search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    const result = await executeQuery(query, queryParams);
    return result.success ? result.data : [];
  }

  /**
   * Delete user
   */
  static async delete(id) {
    const query = 'DELETE FROM Users WHERE user_id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  /**
   * Update user status (activate/deactivate/suspend) - Not implemented in new schema
   */
  static async updateStatus(id, status) {
    // This functionality is removed as status field doesn't exist in new schema
    // If needed, you can add a status field back to Users table
    throw new Error('Status functionality not implemented in current schema');
  }

  /**
   * Check if user is a member of a specific project
   */
  static async isProjectMember(userId, projectId) {
    const query = `
      SELECT ptu.project_id 
      FROM ProjectTaskUser ptu 
      WHERE ptu.user_id = ? AND ptu.project_id = ?
    `;
    
    const result = await executeQuery(query, [userId, projectId]);
    return result.success && result.data.length > 0;
  }

  /**
   * Check if user is admin/owner/manager of a specific project
   */
  static async isProjectAdmin(userId, projectId) {
    const query = `
      SELECT ptu.project_id 
      FROM ProjectTaskUser ptu 
      WHERE ptu.user_id = ? AND ptu.project_id = ? AND ptu.role IN ('owner', 'manager')
      UNION
      SELECT p.project_id 
      FROM Projects p 
      WHERE p.owner_id = ? AND p.project_id = ?
    `;
    
    const result = await executeQuery(query, [userId, projectId, userId, projectId]);
    return result.success && result.data.length > 0;
  }

  /**
   * Get user's projects
   */
  static async getProjects(userId, limit = 20, offset = 0) {
    const query = `
      SELECT p.*, ptu.role as member_role,
             u.name as creator_name,
             (SELECT COUNT(DISTINCT ptu2.user_id) FROM ProjectTaskUser ptu2 WHERE ptu2.project_id = p.project_id) as member_count,
             (SELECT COUNT(*) FROM Tasks t WHERE EXISTS (SELECT 1 FROM ProjectTaskUser ptu3 WHERE ptu3.task_id = t.task_id AND ptu3.project_id = p.project_id)) as task_count
      FROM Projects p
      JOIN ProjectTaskUser ptu ON p.project_id = ptu.project_id
      JOIN Users u ON p.owner_id = u.user_id
      WHERE ptu.user_id = ?
      GROUP BY p.project_id, ptu.role, u.name
      ORDER BY p.updated_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const result = await executeQuery(query, [userId, limit, offset]);
    return result.success ? result.data : [];
  }

  /**
   * Get user statistics
   */
  static async getStats(userId) {
    const queries = [
      'SELECT COUNT(DISTINCT project_id) as project_count FROM ProjectTaskUser WHERE user_id = ?',
      'SELECT COUNT(DISTINCT task_id) as task_count FROM ProjectTaskUser WHERE user_id = ?',
      'SELECT COUNT(DISTINCT t.task_id) as completed_tasks FROM Tasks t JOIN ProjectTaskUser ptu ON t.task_id = ptu.task_id WHERE ptu.user_id = ? AND t.status = "completed"'
    ];
    
    const stats = {};
    
    for (const query of queries) {
      const result = await executeQuery(query, [userId]);
      if (result.success) {
        const key = query.match(/as (\w+)/)[1];
        stats[key] = result.data[0][key] || 0;
      }
    }
    
    return stats;
  }
}

module.exports = User;
