const { executeQuery, executeTransaction } = require('./database');

/**
 * Project Model - handles all project-related database operations
 */
class Project {

  /**
   * Find project by ID with member check
   */
  static async findById(projectId, userId = null) {
    let query = `
      SELECT p.*, u.name as creator_name,
             (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks
      FROM projects p
      JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `;
    
    const params = [projectId];
    
    // If userId provided, check if user is a member
    if (userId) {
      query += `
        AND (p.is_private = FALSE OR 
             EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = ?))
      `;
      params.push(userId);
    }
    
    const result = await executeQuery(query, params);
    
    if (result.success && result.data.length > 0) {
      const project = result.data[0];
      
      // Get user's role in the project if userId provided
      if (userId) {
        const roleQuery = `
          SELECT pm.role,
                 CASE WHEN p.created_by = ? THEN 'owner' ELSE pm.role END as effective_role
          FROM project_members pm
          JOIN projects p ON p.id = pm.project_id
          WHERE pm.project_id = ? AND pm.user_id = ?
        `;
        
        const roleResult = await executeQuery(roleQuery, [userId, projectId, userId]);
        if (roleResult.success && roleResult.data.length > 0) {
          project.user_role = roleResult.data[0].effective_role;
        }
      }
      
      return project;
    }
    return null;
  }

  /**
   * Create a new project
   */
  static async create(projectData, creatorId) {
    const { name, description, deadline, is_private = false } = projectData;
    
    const queries = [
      // Create project
      {
        query: 'INSERT INTO projects (name, description, deadline, is_private, created_by) VALUES (?, ?, ?, ?, ?)',
        params: [name, description, deadline, is_private, creatorId]
      }
    ];
    
    const result = await executeTransaction(queries);
    
    if (result.success) {
      const projectId = result.data[0].insertId;
      
      // Add creator as admin member
      await executeQuery(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
        [projectId, creatorId, 'admin']
      );
      
      return await Project.findById(projectId, creatorId);
    }
    return null;
  }

  /**
   * Update project
   */
  static async update(projectId, updateData, userId) {
    // Check if user has permission to update
    const hasPermission = await Project.canManage(projectId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }
    
    const allowedFields = ['name', 'description', 'deadline', 'status', 'is_private'];
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      return null;
    }
    
    values.push(projectId);
    
    const query = `UPDATE projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const result = await executeQuery(query, values);
    
    if (result.success) {
      return await Project.findById(projectId, userId);
    }
    return null;
  }

  /**
   * Delete project
   */
  static async delete(projectId, userId) {
    // Check if user is project owner
    const project = await executeQuery('SELECT created_by FROM projects WHERE id = ?', [projectId]);
    
    if (!project.success || project.data.length === 0) {
      throw new Error('Project not found');
    }
    
    if (project.data[0].created_by !== userId) {
      throw new Error('Only project owner can delete the project');
    }
    
    const query = 'DELETE FROM projects WHERE id = ?';
    const result = await executeQuery(query, [projectId]);
    return result.success;
  }

  /**
   * Get user's projects
   */
  static async getUserProjects(userId, filters = {}, limit = 20, offset = 0) {
    let query = `
      SELECT p.*, pm.role as user_role,
             u.name as creator_name,
             (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) as member_count,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      JOIN users u ON p.created_by = u.id
      WHERE pm.user_id = ?
    `;
    
    const params = [userId];
    
    // Add filters
    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }
    
    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += ' ORDER BY p.updated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await executeQuery(query, params);
    return result.success ? result.data : [];
  }

  /**
   * Get project members
   */
  static async getMembers(projectId, userId) {
    // Check if user has access to project
    const hasAccess = await Project.hasAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }
    
    const query = `
      SELECT pm.*, u.name, u.email, u.avatar_url, u.status,
             pm.joined_at
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY pm.role DESC, pm.joined_at ASC
    `;
    
    const result = await executeQuery(query, [projectId]);
    return result.success ? result.data : [];
  }

  /**
   * Add member to project
   */
  static async addMember(projectId, memberData, userId) {
    // Check if user can manage project
    const canManage = await Project.canManage(projectId, userId);
    if (!canManage) {
      throw new Error('Permission denied');
    }
    
    const { userId: memberId, email, role = 'member' } = memberData;
    let targetUserId = memberId;
    
    // If email provided, find user by email
    if (!targetUserId && email) {
      const userQuery = 'SELECT id FROM users WHERE email = ? AND status = "active"';
      const userResult = await executeQuery(userQuery, [email]);
      
      if (!userResult.success || userResult.data.length === 0) {
        throw new Error('User not found or inactive');
      }
      
      targetUserId = userResult.data[0].id;
    }
    
    if (!targetUserId) {
      throw new Error('User ID or email required');
    }
    
    // Check if user is already a member
    const existingMember = await executeQuery(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, targetUserId]
    );
    
    if (existingMember.success && existingMember.data.length > 0) {
      throw new Error('User is already a project member');
    }
    
    const query = 'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)';
    const result = await executeQuery(query, [projectId, targetUserId, role]);
    
    return result.success;
  }

  /**
   * Update member role
   */
  static async updateMemberRole(projectId, memberId, newRole, userId) {
    // Check if user can manage project
    const canManage = await Project.canManage(projectId, userId);
    if (!canManage) {
      throw new Error('Permission denied');
    }
    
    // Can't change project owner's role
    const isOwner = await executeQuery(
      'SELECT id FROM projects WHERE id = ? AND created_by = ?',
      [projectId, memberId]
    );
    
    if (isOwner.success && isOwner.data.length > 0) {
      throw new Error('Cannot change project owner role');
    }
    
    const query = 'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?';
    const result = await executeQuery(query, [newRole, projectId, memberId]);
    
    return result.success;
  }

  /**
   * Remove member from project
   */
  static async removeMember(projectId, memberId, userId) {
    // Check if user can manage project
    const canManage = await Project.canManage(projectId, userId);
    if (!canManage) {
      throw new Error('Permission denied');
    }
    
    // Can't remove project owner
    const isOwner = await executeQuery(
      'SELECT id FROM projects WHERE id = ? AND created_by = ?',
      [projectId, memberId]
    );
    
    if (isOwner.success && isOwner.data.length > 0) {
      throw new Error('Cannot remove project owner');
    }
    
    const query = 'DELETE FROM project_members WHERE project_id = ? AND user_id = ?';
    const result = await executeQuery(query, [projectId, memberId]);
    
    return result.success;
  }

  /**
   * Leave project (for members)
   */
  static async leave(projectId, userId) {
    // Can't leave if user is project owner
    const isOwner = await executeQuery(
      'SELECT id FROM projects WHERE id = ? AND created_by = ?',
      [projectId, userId]
    );
    
    if (isOwner.success && isOwner.data.length > 0) {
      throw new Error('Project owner cannot leave the project');
    }
    
    const query = 'DELETE FROM project_members WHERE project_id = ? AND user_id = ?';
    const result = await executeQuery(query, [projectId, userId]);
    
    return result.success;
  }

  /**
   * Get project statistics
   */
  static async getStats(projectId, userId) {
    // Check access
    const hasAccess = await Project.hasAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }
    
    const queries = [
      'SELECT COUNT(*) as total_tasks FROM tasks WHERE project_id = ?',
      'SELECT COUNT(*) as completed_tasks FROM tasks WHERE project_id = ? AND status = "completed"',
      'SELECT COUNT(*) as pending_tasks FROM tasks WHERE project_id = ? AND status = "pending"',
      'SELECT COUNT(*) as in_progress_tasks FROM tasks WHERE project_id = ? AND status = "in_progress"',
      'SELECT COUNT(*) as total_members FROM project_members WHERE project_id = ?'
    ];
    
    const stats = {};
    
    for (const query of queries) {
      const result = await executeQuery(query, [projectId]);
      if (result.success) {
        const key = query.match(/as (\w+)/)[1];
        stats[key] = result.data[0][key] || 0;
      }
    }
    
    return stats;
  }

  /**
   * Check if user has access to project
   */
  static async hasAccess(projectId, userId) {
    const query = `
      SELECT p.id 
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      WHERE p.id = ? AND (p.is_private = FALSE OR pm.user_id IS NOT NULL)
    `;
    
    const result = await executeQuery(query, [userId, projectId]);
    return result.success && result.data.length > 0;
  }

  /**
   * Check if user can manage project (admin or owner)
   */
  static async canManage(projectId, userId) {
    const query = `
      SELECT p.id 
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      WHERE p.id = ? AND (p.created_by = ? OR pm.role = 'admin')
    `;
    
    const result = await executeQuery(query, [userId, projectId, userId]);
    return result.success && result.data.length > 0;
  }
}

module.exports = Project;
