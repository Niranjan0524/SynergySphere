const { executeQuery, executeTransaction } = require('./database');
const { createAppError } = require('../middleware/errorHandler');

/**
 * Task Model - handles all task-related database operations
 */
class Task {

  /**
   * Find task by ID
   */
  static async findById(taskId, userId) {
    const query = `
      SELECT t.*, 
             p.name as project_name,
             p.project_id as project_id,
             u.name as assignee_name,
             u.email as assignee_email,
             u.profile_image as assignee_avatar
      FROM Tasks t
      JOIN ProjectTaskUser ptu ON t.task_id = ptu.task_id
      JOIN Projects p ON ptu.project_id = p.project_id
      LEFT JOIN Users u ON ptu.user_id = u.user_id AND ptu.role != 'owner'
      WHERE t.task_id = ? AND EXISTS (
        SELECT 1 FROM ProjectTaskUser ptu2 
        WHERE ptu2.project_id = ptu.project_id AND ptu2.user_id = ?
      )
    `;
    
    const result = await executeQuery(query, [taskId, userId]);
    return result.success && result.data.length > 0 ? result.data[0] : null;
  }

  /**
   * Create a new task
   */static async create(taskData, creatorId) {
  const { 
    project_id, 
    title, 
    description, 
    due_date, 
    priority = 'medium',
    status = 'progress'
  } = taskData;
  
  // Verify creator has access to project
  const hasAccess = await executeQuery(
    'SELECT ptu.project_id FROM ProjectTaskUser ptu WHERE ptu.project_id = ? AND ptu.user_id = ?',
    [project_id, creatorId] 
  );
  
  // if (!hasAccess.success || hasAccess.data.length === 0) {
  //   throw createAppError('Access denied to project', 403);
  // }
  
  const query = `
    INSERT INTO Tasks (title, description, due_date, priority, status) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const result = await executeQuery(query, [
    title, description, due_date, priority, status
  ]);
  
  if (result.success) {
    const taskId = result.data.insertId;
    
    // Link task to project and creator
    const linkQuery = `
      INSERT INTO ProjectTaskUser (project_id, task_id, user_id, role) 
      VALUES (?, ?, ?, 'creator')
    `;
    
    await executeQuery(linkQuery, [project_id, taskId, creatorId]);
    
    return await Task.findById(taskId, creatorId);
  }
  return null;
}

  /**
   * Update task
   */
  static async update(taskId, updateData, userId) {
    // Check if user has access to task
    const task = await Task.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found or access denied');
    }
    
    const allowedFields = ['title', 'description', 'due_date', 'priority', 'status', 'assignee_id'];
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        // Handle status change
        if (key === 'status' && updateData[key] === 'completed') {
          fields.push('completed_at = CURRENT_TIMESTAMP');
        } else if (key === 'status' && updateData[key] !== 'completed') {
          fields.push('completed_at = NULL');
        }
        
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      return null;
    }
    
    values.push(taskId);
    
    const query = `UPDATE tasks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const result = await executeQuery(query, values);
    
    if (result.success) {
      return await Task.findById(taskId, userId);
    }
    return null;
  }

  /**
   * Delete task
   */
  static async delete(taskId, userId) {
    // Check if user has access to task
    const task = await Task.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found or access denied');
    }
    
    const query = 'DELETE FROM tasks WHERE id = ?';
    const result = await executeQuery(query, [taskId]);
    return result.success;
  }

  /**
   * Get user's tasks
   */
  static async getUserTasks(userId, filters = {}, limit = 20, offset = 0) {
    let query = `
      SELECT t.*, 
             p.name as project_name,
             p.id as project_id,
             creator.name as created_by_name,
             assignee.name as assignee_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assignee_id = assignee.id
      WHERE pm.user_id = ? AND (t.assignee_id = ? OR t.created_by = ?)
    `;
    
    const params = [userId, userId, userId];
    
    // Add filters
    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND t.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.project_id) {
      query += ' AND t.project_id = ?';
      params.push(filters.project_id);
    }
    
    if (filters.due_soon) {
      query += ' AND t.due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)';
    }
    
    query += ' ORDER BY t.updated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await executeQuery(query, params);
    return result.success ? result.data : [];
  }

  /**
   * Get project tasks
   */
  static async getProjectTasks(projectId, userId, filters = {}, limit = 50, offset = 0) {
    // Verify user has access to project
    const hasAccess = await executeQuery(
      'SELECT pm.id FROM project_members pm WHERE pm.project_id = ? AND pm.user_id = ?',
      [projectId, userId]
    );
    
    if (!hasAccess.success || hasAccess.data.length === 0) {
      throw createAppError('Access denied to project', 402);
    }
    
    let query = `
      SELECT t.*, 
             creator.name as created_by_name,
             assignee.name as assignee_name,
             assignee.email as assignee_email,
             assignee.avatar_url as assignee_avatar
      FROM tasks t
      JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assignee_id = assignee.id
      WHERE t.project_id = ?
    `;
    
    const params = [projectId];
    
    // Add filters
    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    
    if (filters.assignee_id) {
      query += ' AND t.assignee_id = ?';
      params.push(filters.assignee_id);
    }
    
    if (filters.priority) {
      query += ' AND t.priority = ?';
      params.push(filters.priority);
    }
    
    query += ' ORDER BY t.updated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await executeQuery(query, params);
    return result.success ? result.data : [];
  }

  /**
   * Update task status
   */
  static async updateStatus(taskId, status, userId) {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    
    let query = 'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];
    
    if (status === 'completed') {
      query += ', completed_at = CURRENT_TIMESTAMP';
    } else {
      query += ', completed_at = NULL';
    }
    
    query += ' WHERE id = ? AND id IN (SELECT t.id FROM (SELECT t2.id FROM tasks t2 JOIN project_members pm ON t2.project_id = pm.project_id WHERE pm.user_id = ?) AS authorized_tasks)';
    params.push(taskId, userId);
    
    const result = await executeQuery(query, params);
    return result.success && result.data.affectedRows > 0;
  }

  /**
   * Assign task to user
   */
  static async assign(taskId, assigneeId, userId) {
    // Verify assignee is project member
    const task = await Task.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found or access denied');
    }
    
    if (assigneeId) {
      const isProjectMember = await executeQuery(
        'SELECT pm.id FROM project_members pm WHERE pm.project_id = ? AND pm.user_id = ?',
        [task.project_id, assigneeId]
      );
      
      if (!isProjectMember.success || isProjectMember.data.length === 0) {
        throw new Error('Assignee is not a project member');
      }
    }
    
    const query = 'UPDATE tasks SET assignee_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [assigneeId, taskId]);
    
    if (result.success) {
      return await Task.findById(taskId, userId);
    }
    return null;
  }

  /**
   * Bulk update tasks
   */
  static async bulkUpdate(taskIds, updates, userId) {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error('Task IDs array required');
    }
    
    // Verify all tasks belong to projects user has access to
    const placeholders = taskIds.map(() => '?').join(',');
    const accessQuery = `
      SELECT t.id 
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE t.id IN (${placeholders}) AND pm.user_id = ?
    `;
    
    const accessResult = await executeQuery(accessQuery, [...taskIds, userId]);
    
    if (!accessResult.success || accessResult.data.length !== taskIds.length) {
      throw new Error('Access denied to one or more tasks');
    }
    
    const allowedFields = ['status', 'assignee_id', 'priority'];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const query = `
      UPDATE tasks 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})
    `;
    
    const result = await executeQuery(query, [...values, ...taskIds]);
    return result.success;
  }

  /**
   * Get overdue tasks for user
   */
  static async getOverdueTasks(userId) {
    const query = `
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ? 
        AND t.due_date < CURDATE() 
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
    `;
    
    const result = await executeQuery(query, [userId]);
    return result.success ? result.data : [];
  }

  /**
   * Get tasks due soon (within next 7 days)
   */
  static async getTasksDueSoon(userId) {
    const query = `
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ? 
        AND t.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
    `;
    
    const result = await executeQuery(query, [userId]);
    return result.success ? result.data : [];
  }

  /**
   * Get task statistics for user
   */
  static async getUserTaskStats(userId) {
    const queries = [
      `SELECT COUNT(*) as total_tasks 
       FROM tasks t 
       JOIN project_members pm ON t.project_id = pm.project_id 
       WHERE pm.user_id = ? AND t.assignee_id = ?`,
      
      `SELECT COUNT(*) as completed_tasks 
       FROM tasks t 
       JOIN project_members pm ON t.project_id = pm.project_id 
       WHERE pm.user_id = ? AND t.assignee_id = ? AND t.status = 'completed'`,
      
      `SELECT COUNT(*) as overdue_tasks 
       FROM tasks t 
       JOIN project_members pm ON t.project_id = pm.project_id 
       WHERE pm.user_id = ? AND t.assignee_id = ? AND t.due_date < CURDATE() AND t.status NOT IN ('completed', 'cancelled')`
    ];
    
    const stats = {};
    
    for (const query of queries) {
      const result = await executeQuery(query, [userId, userId]);
      if (result.success) {
        const key = query.match(/as (\w+)/)[1];
        stats[key] = result.data[0][key] || 0;
      }
    }
    
    return stats;
  }
}

module.exports = Task;
