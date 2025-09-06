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
             (SELECT COUNT(DISTINCT ptu.user_id) FROM ProjectTaskUser ptu WHERE ptu.project_id = p.project_id) as member_count,
             (SELECT COUNT(DISTINCT ptu.task_id) FROM ProjectTaskUser ptu WHERE ptu.project_id = p.project_id AND ptu.task_id > 0) as task_count,
             (SELECT COUNT(DISTINCT t.task_id) FROM Tasks t JOIN ProjectTaskUser ptu ON t.task_id = ptu.task_id WHERE ptu.project_id = p.project_id AND t.status = 'completed') as completed_tasks
      FROM Projects p
      JOIN Users u ON p.owner_id = u.user_id
      WHERE p.project_id = ?
    `;
    
    const params = [projectId];
    
    // If userId provided, check if user is a member
    if (userId) {
      query += `
        AND EXISTS (SELECT 1 FROM ProjectTaskUser ptu WHERE ptu.project_id = p.project_id AND ptu.user_id = ?)
      `;
      params.push(userId);
    }
    
    const result = await executeQuery(query, params);
    
    if (result.success && result.data.length > 0) {
      const project = result.data[0];
      
      // Get user's role in the project if userId provided
      if (userId) {
        const roleQuery = `
          SELECT ptu.role,
                 CASE WHEN p.owner_id = ? THEN 'owner' ELSE ptu.role END as effective_role
          FROM ProjectTaskUser ptu
          JOIN Projects p ON p.project_id = ptu.project_id
          WHERE ptu.project_id = ? AND ptu.user_id = ?
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
    const { 
      name, 
      description, 
      start_time,
      deadline, 
      priority = 'medium',
      status = 'waiting',
      profile_image,
      manager_id = creatorId  // Default manager is the creator
    } = projectData;
    
    const query = `
      INSERT INTO Projects (owner_id, manager_id, name, start_time, deadline, priority, status, description, profile_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      creatorId, manager_id, name, start_time, deadline, priority, status, description, profile_image
    ]);
    
    if (result.success) {
      const projectId = result.data.insertId;
      
      // Add creator to ProjectTaskUser as owner (using task_id = 0 for project-level membership)
      const linkQuery = `
        INSERT INTO ProjectTaskUser (project_id, user_id, task_id, role) 
        VALUES (?, ?, 0, 'owner')
      `;
      
      await executeQuery(linkQuery, [projectId, creatorId]);
      
      return await Project.findById(projectId, creatorId);
    }
    return null;
  }

  /**
   * Update project
   */
  static async update(projectId, updateData, userId) {
    // Check if user has permission to update (must be owner or manager)
    const hasPermission = await Project.canManage(projectId, userId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to update project');
    }
    
    const allowedFields = ['name', 'description', 'start_time', 'deadline', 'priority', 'status', 'profile_image', 'manager_id'];
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
    
    values.push(projectId); // Add ID for WHERE clause
    
    const query = `UPDATE Projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?`;
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
    // Check if user is the owner
    const project = await Project.findById(projectId, userId);
    if (!project || project.owner_id !== userId) {
      throw new Error('Only project owner can delete the project');
    }
    
    // This will cascade delete all related records due to foreign key constraints
    const query = 'DELETE FROM Projects WHERE project_id = ?';
    const result = await executeQuery(query, [projectId]);
    return result.success;
  }

  /**
   * Get user's projects
   */
  static async getUserProjects(userId, filters = {}, limit = 20, offset = 0) {
    let query = `
      SELECT p.*, ptu.role as member_role,
             u.name as creator_name,
             (SELECT COUNT(DISTINCT ptu2.user_id) FROM ProjectTaskUser ptu2 WHERE ptu2.project_id = p.project_id) as member_count,
             (SELECT COUNT(DISTINCT ptu2.task_id) FROM ProjectTaskUser ptu2 WHERE ptu2.project_id = p.project_id AND ptu2.task_id > 0) as task_count
      FROM Projects p
      JOIN ProjectTaskUser ptu ON p.project_id = ptu.project_id
      JOIN Users u ON p.owner_id = u.user_id
      WHERE ptu.user_id = ?
    `;
    
    const queryParams = [userId];
    
    // Add filters
    if (filters.status) {
      query += ' AND p.status = ?';
      queryParams.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND p.priority = ?';
      queryParams.push(filters.priority);
    }
    
    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += ' GROUP BY p.project_id, ptu.role, u.name ORDER BY p.updated_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    const result = await executeQuery(query, queryParams);
    return result.success ? result.data : [];
  }

  /**
   * Get project members
   */
  static async getMembers(projectId, userId) {
    // Verify user has access to project
    const hasAccess = await Project.isMember(projectId, userId);
    if (!hasAccess) {
      throw new Error('Access denied to project');
    }
    
    const query = `
      SELECT u.user_id, u.name, u.email, u.profile_image, ptu.role,
             ptu.created_at as joined_at
      FROM Users u
      JOIN ProjectTaskUser ptu ON u.user_id = ptu.user_id
      WHERE ptu.project_id = ? AND ptu.task_id = 0
      ORDER BY 
        CASE ptu.role 
          WHEN 'owner' THEN 1 
          WHEN 'manager' THEN 2 
          ELSE 3 
        END,
        u.name ASC
    `;
    
    const result = await executeQuery(query, [projectId]);
    return result.success ? result.data : [];
  }

  /**
   * Add member to project
   */
  static async addMember(projectId, memberData, userId) {
    const { user_id, role = 'member' } = memberData;
    
    // Check if user has permission to add members (must be owner or manager)
    const hasPermission = await Project.canManage(projectId, userId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to add members');
    }
    
    // Check if user is already a member
    const existingMember = await executeQuery(
      'SELECT project_id FROM ProjectTaskUser WHERE project_id = ? AND user_id = ? AND task_id = 0',
      [projectId, user_id]
    );
    
    if (existingMember.success && existingMember.data.length > 0) {
      throw new Error('User is already a member of this project');
    }
    
    const query = `
      INSERT INTO ProjectTaskUser (project_id, user_id, task_id, role) 
      VALUES (?, ?, 0, ?)
    `;
    
    const result = await executeQuery(query, [projectId, user_id, role]);
    return result.success;
  }

  /**
   * Update member role
   */
  static async updateMemberRole(projectId, memberId, newRole, userId) {
    // Check if user has permission (must be owner)
    const project = await Project.findById(projectId, userId);
    if (!project || project.owner_id !== userId) {
      throw new Error('Only project owner can update member roles');
    }
    
    // Cannot change owner's role
    if (memberId === userId) {
      throw new Error('Cannot change your own role');
    }
    
    const validRoles = ['member', 'manager'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role');
    }
    
    const query = `
      UPDATE ProjectTaskUser 
      SET role = ? 
      WHERE project_id = ? AND user_id = ? AND task_id = 0
    `;
    
    const result = await executeQuery(query, [newRole, projectId, memberId]);
    return result.success;
  }

  /**
   * Remove member from project
   */
  static async removeMember(projectId, memberId, userId) {
    // Check if user has permission (must be owner or manager)
    const hasPermission = await Project.canManage(projectId, userId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to remove members');
    }
    
    // Cannot remove the owner
    const project = await Project.findById(projectId, userId);
    if (project && project.owner_id === memberId) {
      throw new Error('Cannot remove project owner');
    }
    
    const query = 'DELETE FROM ProjectTaskUser WHERE project_id = ? AND user_id = ?';
    const result = await executeQuery(query, [projectId, memberId]);
    return result.success;
  }

  /**
   * Leave project
   */
  static async leaveProject(projectId, userId) {
    // Check if user is the owner
    const project = await Project.findById(projectId, userId);
    if (project && project.owner_id === userId) {
      throw new Error('Project owner cannot leave the project. Transfer ownership or delete the project.');
    }
    
    const query = 'DELETE FROM ProjectTaskUser WHERE project_id = ? AND user_id = ?';
    const result = await executeQuery(query, [projectId, userId]);
    return result.success;
  }

  /**
   * Check if user is a member of the project
   */
  static async isMember(projectId, userId) {
    const query = 'SELECT project_id FROM ProjectTaskUser WHERE project_id = ? AND user_id = ?';
    const result = await executeQuery(query, [projectId, userId]);
    return result.success && result.data.length > 0;
  }

  /**
   * Check if user can manage the project (owner or manager)
   */
  static async canManage(projectId, userId) {
    const query = `
      SELECT ptu.role, p.owner_id
      FROM ProjectTaskUser ptu
      JOIN Projects p ON p.project_id = ptu.project_id
      WHERE ptu.project_id = ? AND ptu.user_id = ? AND ptu.task_id = 0
    `;
    
    const result = await executeQuery(query, [projectId, userId]);
    
    if (result.success && result.data.length > 0) {
      const member = result.data[0];
      return member.owner_id === userId || ['owner', 'manager'].includes(member.role);
    }
    
    return false;
  }

  /**
   * Get project statistics
   */
  static async getStats(projectId, userId) {
    // Verify user has access to project
    const hasAccess = await Project.isMember(projectId, userId);
    if (!hasAccess) {
      throw new Error('Access denied to project');
    }
    
    const queries = [
      `SELECT COUNT(DISTINCT ptu.user_id) as member_count 
       FROM ProjectTaskUser ptu WHERE ptu.project_id = ?`,
      `SELECT COUNT(DISTINCT ptu.task_id) as task_count 
       FROM ProjectTaskUser ptu WHERE ptu.project_id = ? AND ptu.task_id > 0`,
      `SELECT COUNT(DISTINCT t.task_id) as completed_tasks 
       FROM Tasks t JOIN ProjectTaskUser ptu ON t.task_id = ptu.task_id 
       WHERE ptu.project_id = ? AND t.status = 'completed'`,
      `SELECT COUNT(DISTINCT t.task_id) as overdue_tasks 
       FROM Tasks t JOIN ProjectTaskUser ptu ON t.task_id = ptu.task_id 
       WHERE ptu.project_id = ? AND t.status = 'progress' AND t.deadline < NOW()`
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
}

module.exports = Project;
