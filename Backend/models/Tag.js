const { executeQuery, executeTransaction } = require('./database');

/**
 * Tag Model - handles all tag-related database operations
 */
class Tag {

  /**
   * Create a new tag
   */
  static async create(tagData) {
    const { tag_name, tag_type } = tagData;
    
    if (!['project', 'task'].includes(tag_type)) {
      throw new Error('Invalid tag type. Must be "project" or "task"');
    }
    
    const query = `
      INSERT INTO Tags (tag_name, tag_type) 
      VALUES (?, ?)
    `;
    
    const result = await executeQuery(query, [tag_name, tag_type]);
    
    if (result.success) {
      return await Tag.findById(result.data.insertId);
    }
    return null;
  }

  /**
   * Find tag by ID
   */
  static async findById(tagId) {
    const query = 'SELECT * FROM Tags WHERE tag_id = ?';
    const result = await executeQuery(query, [tagId]);
    
    if (result.success && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  }

  /**
   * Find tag by name and type
   */
  static async findByNameAndType(tagName, tagType) {
    const query = 'SELECT * FROM Tags WHERE tag_name = ? AND tag_type = ?';
    const result = await executeQuery(query, [tagName, tagType]);
    
    if (result.success && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  }

  /**
   * Get all tags by type
   */
  static async getByType(tagType, limit = 50, offset = 0) {
    if (!['project', 'task'].includes(tagType)) {
      throw new Error('Invalid tag type. Must be "project" or "task"');
    }
    
    const query = `
      SELECT t.*, 
             COUNT(CASE WHEN t.tag_type = 'project' THEN ptl.project_id END) as project_usage_count,
             COUNT(CASE WHEN t.tag_type = 'task' THEN ttl.task_id END) as task_usage_count
      FROM Tags t
      LEFT JOIN ProjectTagLinks ptl ON t.tag_id = ptl.tag_id
      LEFT JOIN TaskTagLinks ttl ON t.tag_id = ttl.tag_id
      WHERE t.tag_type = ?
      GROUP BY t.tag_id
      ORDER BY t.tag_name ASC
      LIMIT ? OFFSET ?
    `;
    
    const result = await executeQuery(query, [tagType, limit, offset]);
    return result.success ? result.data : [];
  }

  /**
   * Get all tags
   */
  static async getAll(limit = 100, offset = 0) {
    const query = `
      SELECT t.*, 
             COUNT(CASE WHEN t.tag_type = 'project' THEN ptl.project_id END) as project_usage_count,
             COUNT(CASE WHEN t.tag_type = 'task' THEN ttl.task_id END) as task_usage_count
      FROM Tags t
      LEFT JOIN ProjectTagLinks ptl ON t.tag_id = ptl.tag_id
      LEFT JOIN TaskTagLinks ttl ON t.tag_id = ttl.tag_id
      GROUP BY t.tag_id
      ORDER BY t.tag_type ASC, t.tag_name ASC
      LIMIT ? OFFSET ?
    `;
    
    const result = await executeQuery(query, [limit, offset]);
    return result.success ? result.data : [];
  }

  /**
   * Search tags by name
   */
  static async search(searchTerm, tagType = null, limit = 20) {
    let query = `
      SELECT t.*, 
             COUNT(CASE WHEN t.tag_type = 'project' THEN ptl.project_id END) as project_usage_count,
             COUNT(CASE WHEN t.tag_type = 'task' THEN ttl.task_id END) as task_usage_count
      FROM Tags t
      LEFT JOIN ProjectTagLinks ptl ON t.tag_id = ptl.tag_id
      LEFT JOIN TaskTagLinks ttl ON t.tag_id = ttl.tag_id
      WHERE t.tag_name LIKE ?
    `;
    
    const params = [`%${searchTerm}%`];
    
    if (tagType && ['project', 'task'].includes(tagType)) {
      query += ' AND t.tag_type = ?';
      params.push(tagType);
    }
    
    query += ' GROUP BY t.tag_id ORDER BY t.tag_name ASC LIMIT ?';
    params.push(limit);
    
    const result = await executeQuery(query, params);
    return result.success ? result.data : [];
  }

  /**
   * Update tag
   */
  static async update(tagId, updateData) {
    const allowedFields = ['tag_name'];
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
    
    values.push(tagId); // Add ID for WHERE clause
    
    const query = `UPDATE Tags SET ${fields.join(', ')} WHERE tag_id = ?`;
    const result = await executeQuery(query, values);
    
    if (result.success) {
      return await Tag.findById(tagId);
    }
    return null;
  }

  /**
   * Delete tag
   */
  static async delete(tagId) {
    // This will cascade delete all associated links due to foreign key constraints
    const query = 'DELETE FROM Tags WHERE tag_id = ?';
    const result = await executeQuery(query, [tagId]);
    return result.success;
  }

  /**
   * Add tag to project
   */
  static async addToProject(projectId, tagId) {
    // Verify tag is of type 'project'
    const tag = await Tag.findById(tagId);
    if (!tag || tag.tag_type !== 'project') {
      throw new Error('Tag not found or not a project tag');
    }
    
    const query = `
      INSERT IGNORE INTO ProjectTagLinks (project_id, tag_id) 
      VALUES (?, ?)
    `;
    
    const result = await executeQuery(query, [projectId, tagId]);
    return result.success;
  }

  /**
   * Remove tag from project
   */
  static async removeFromProject(projectId, tagId) {
    const query = 'DELETE FROM ProjectTagLinks WHERE project_id = ? AND tag_id = ?';
    const result = await executeQuery(query, [projectId, tagId]);
    return result.success;
  }

  /**
   * Add tag to task
   */
  static async addToTask(taskId, tagId) {
    // Verify tag is of type 'task'
    const tag = await Tag.findById(tagId);
    if (!tag || tag.tag_type !== 'task') {
      throw new Error('Tag not found or not a task tag');
    }
    
    const query = `
      INSERT IGNORE INTO TaskTagLinks (task_id, tag_id) 
      VALUES (?, ?)
    `;
    
    const result = await executeQuery(query, [taskId, tagId]);
    return result.success;
  }

  /**
   * Remove tag from task
   */
  static async removeFromTask(taskId, tagId) {
    const query = 'DELETE FROM TaskTagLinks WHERE task_id = ? AND tag_id = ?';
    const result = await executeQuery(query, [taskId, tagId]);
    return result.success;
  }

  /**
   * Get tags for a project
   */
  static async getForProject(projectId) {
    const query = `
      SELECT t.*
      FROM Tags t
      JOIN ProjectTagLinks ptl ON t.tag_id = ptl.tag_id
      WHERE ptl.project_id = ?
      ORDER BY t.tag_name ASC
    `;
    
    const result = await executeQuery(query, [projectId]);
    return result.success ? result.data : [];
  }

  /**
   * Get tags for a task
   */
  static async getForTask(taskId) {
    const query = `
      SELECT t.*
      FROM Tags t
      JOIN TaskTagLinks ttl ON t.tag_id = ttl.tag_id
      WHERE ttl.task_id = ?
      ORDER BY t.tag_name ASC
    `;
    
    const result = await executeQuery(query, [taskId]);
    return result.success ? result.data : [];
  }
}

module.exports = Tag;
