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
    const query = 'SELECT id, name, email, role, status, avatar_url, bio, created_at, updated_at, last_login FROM users WHERE id = ?';
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
    const query = 'SELECT * FROM users WHERE email = ?';
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
    const { name, email, password, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (name, email, password_hash, role) 
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [name, email, password_hash, role]);
    
    if (result.success) {
      return await User.findById(result.data.insertId);
    }
    return null;
  }

  /**
   * Update user information
   */
  static async update(id, updateData) {
    const allowedFields = ['name', 'email', 'bio', 'avatar_url'];
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
    
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
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
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [password_hash, id]);
    
    return result.success;
  }

  /**
   * Verify user password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    return await executeQuery(query, [id]);
  }

  /**
   * Search users by name or email
   */
  static async search(searchTerm, limit = 10, offset = 0) {
    const query = `
      SELECT id, name, email, avatar_url, status 
      FROM users 
      WHERE (name LIKE ? OR email LIKE ?) AND status = 'active'
      ORDER BY name ASC 
      LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await executeQuery(query, [searchPattern, searchPattern, limit, offset]);
    
    return result.success ? result.data : [];
  }

  /**
   * Get all users (admin only)
   */
  static async getAll(limit = 50, offset = 0, filters = {}) {
    let query = 'SELECT id, name, email, role, status, avatar_url, created_at, last_login FROM users';
    const queryParams = [];
    const conditions = [];
    
    // Add filters
    if (filters.status) {
      conditions.push('status = ?');
      queryParams.push(filters.status);
    }
    
    if (filters.role) {
      conditions.push('role = ?');
      queryParams.push(filters.role);
    }
    
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
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  /**
   * Update user status (activate/deactivate/suspend)
   */
  static async updateStatus(id, status) {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    
    const query = 'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [status, id]);
    return result.success;
  }

  /**
   * Check if user is a member of a specific project
   */
  static async isProjectMember(userId, projectId) {
    const query = `
      SELECT pm.id 
      FROM project_members pm 
      WHERE pm.user_id = ? AND pm.project_id = ?
    `;
    
    const result = await executeQuery(query, [userId, projectId]);
    return result.success && result.data.length > 0;
  }

  /**
   * Check if user is admin of a specific project
   */
  static async isProjectAdmin(userId, projectId) {
    const query = `
      SELECT pm.id 
      FROM project_members pm 
      WHERE pm.user_id = ? AND pm.project_id = ? AND pm.role = 'admin'
      UNION
      SELECT p.id 
      FROM projects p 
      WHERE p.created_by = ? AND p.id = ?
    `;
    
    const result = await executeQuery(query, [userId, projectId, userId, projectId]);
    return result.success && result.data.length > 0;
  }

  /**
   * Get user's projects
   */
  static async getProjects(userId, limit = 20, offset = 0) {
    const query = `
      SELECT p.*, pm.role as member_role,
             u.name as creator_name,
             (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) as member_count,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      JOIN users u ON p.created_by = u.id
      WHERE pm.user_id = ?
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
      'SELECT COUNT(*) as project_count FROM project_members WHERE user_id = ?',
      'SELECT COUNT(*) as task_count FROM tasks WHERE assignee_id = ?',
      'SELECT COUNT(*) as completed_tasks FROM tasks WHERE assignee_id = ? AND status = "completed"',
      'SELECT COUNT(*) as created_tasks FROM tasks WHERE created_by = ?'
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
