const { executeQuery } = require('../models/database');
const { asyncErrorHandler, createAppError } = require('../middleware/errorHandler');

/**
 * Project Controller
 * Handles project-related operations
 */

/**
 * Get user's projects
 * GET /api/v1/projects /
 */
const getUserProjects = asyncErrorHandler(async (req, res) => {
  const { userId } = req.query; // Get userId from query params since we removed auth middleware
  const { status, search, limit = 20, offset = 0 } = req.query;

  if (!userId) {
    throw createAppError('userId is required', 400);
  }

  try {
    let query = `
      SELECT p.*, 
             u1.name as owner_name,
             u2.name as manager_name,
             (SELECT COUNT(DISTINCT ptu.user_id) FROM ProjectTaskUser ptu WHERE ptu.project_id = p.project_id AND ptu.task_id = 0) as member_count
      FROM Projects p
      LEFT JOIN Users u1 ON p.owner_id = u1.user_id
      LEFT JOIN Users u2 ON p.manager_id = u2.user_id
      LEFT JOIN ProjectTaskUser ptu ON p.project_id = ptu.project_id AND ptu.task_id = 0
      WHERE ptu.user_id = ?
    `;
    
    const params = [userId];
    
    // Add filters
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' GROUP BY p.project_id ORDER BY p.updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);
    
    if (!result.success) {
      throw createAppError('Failed to fetch projects', 500);
    }

    res.status(200).json({
      success: true,
      data: {
        projects: result.data,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.data.length
        }
      }
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createAppError('Failed to fetch projects', 500);
  }
});

/**
 * Create a new project
 * POST /api/v1/projects
 */
const createProject = asyncErrorHandler(async (req, res) => {
  const { ownerID, managerID, name, deadline, priority, status, description } = req.body;

  console.log('Project creation attempt:', { ownerID, managerID, name, deadline, priority, status, description });

  // Validate required fields
  if (!ownerID || !managerID || !name || !deadline || !priority || !status) {
    throw createAppError('ownerID, managerID, name, deadline, priority, and status are required', 400);
  }

  try {
    console.log('1. Creating Projects table if not exists...');
    // First, ensure the Projects table exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Projects (
        project_id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        manager_id INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        deadline DATETIME NOT NULL,
        priority ENUM('low','medium','high') DEFAULT 'medium',
        status ENUM('waiting','progress','completed') DEFAULT 'waiting',
        description TEXT,
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    const tableResult = await executeQuery(createTableQuery);
    console.log('Projects table creation result:', tableResult.success ? 'SUCCESS' : tableResult.error);

    console.log('2. Validating user IDs...');
    // Check if owner and manager exist
    const checkOwnerQuery = 'SELECT user_id FROM Users WHERE user_id = ?';
    const ownerResult = await executeQuery(checkOwnerQuery, [ownerID]);
    
    if (!ownerResult.success || ownerResult.data.length === 0) {
      throw createAppError('Owner ID does not exist', 400);
    }

    const checkManagerQuery = 'SELECT user_id FROM Users WHERE user_id = ?';
    const managerResult = await executeQuery(checkManagerQuery, [managerID]);
    
    if (!managerResult.success || managerResult.data.length === 0) {
      throw createAppError('Manager ID does not exist', 400);
    }

    console.log('3. Creating new project...');
    // Convert ISO datetime to MySQL datetime format
    const deadlineDate = new Date(deadline);
    const mysqlDeadline = deadlineDate.toISOString().slice(0, 19).replace('T', ' ');
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log('Converted deadline from', deadline, 'to', mysqlDeadline);
    console.log('Setting start_time to current time:', currentTime);
    
    // Create new project
    const createProjectQuery = `
      INSERT INTO Projects (owner_id, manager_id, name, start_time, deadline, priority, status, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(createProjectQuery, [ownerID, managerID, name, currentTime, mysqlDeadline, priority, status, description || null]);
    console.log('Project creation result:', result.success ? `SUCCESS - ID: ${result.data.insertId}` : result.error);
    
    if (!result.success) {
      console.error('Database error during project creation:', result.error);
      throw createAppError('Failed to create project', 500);
    }

    console.log('4. Creating ProjectTaskUser table if not exists...');
    // Ensure ProjectTaskUser table exists for linking
    const createLinkTableQuery = `
      CREATE TABLE IF NOT EXISTS ProjectTaskUser (
        project_id INT NOT NULL,
        task_id INT NOT NULL DEFAULT 0,
        user_id INT NOT NULL,
        role ENUM('owner','manager','member') DEFAULT 'member',
        PRIMARY KEY (project_id, task_id, user_id)
      )
    `;
    
    await executeQuery(createLinkTableQuery);

    console.log('5. Adding owner to project members...');
    // Add owner to ProjectTaskUser as owner
    const linkOwnerQuery = `
      INSERT INTO ProjectTaskUser (project_id, task_id, user_id, role) 
      VALUES (?, 0, ?, 'owner')
    `;
    
    const linkOwnerResult = await executeQuery(linkOwnerQuery, [result.data.insertId, ownerID]);
    console.log('Owner linking result:', linkOwnerResult.success ? 'SUCCESS' : linkOwnerResult.error);

    // Add manager to ProjectTaskUser if different from owner
    if (managerID !== ownerID) {
      console.log('6. Adding manager to project members...');
      const linkManagerQuery = `
        INSERT INTO ProjectTaskUser (project_id, task_id, user_id, role) 
        VALUES (?, 0, ?, 'manager')
      `;
      
      const linkManagerResult = await executeQuery(linkManagerQuery, [result.data.insertId, managerID]);
      console.log('Manager linking result:', linkManagerResult.success ? 'SUCCESS' : linkManagerResult.error);
    }

    console.log('7. Retrieving created project...');
    // Get the created project with additional info
    const getProjectQuery = `
      SELECT p.*, 
             u1.name as owner_name,
             u2.name as manager_name
      FROM Projects p
      LEFT JOIN Users u1 ON p.owner_id = u1.user_id
      LEFT JOIN Users u2 ON p.manager_id = u2.user_id
      WHERE p.project_id = ?
    `;
    
    const projectResult = await executeQuery(getProjectQuery, [result.data.insertId]);
    console.log('Project retrieval result:', projectResult.success ? 'SUCCESS' : projectResult.error);
    
    if (!projectResult.success || projectResult.data.length === 0) {
      console.error('Failed to retrieve created project:', projectResult.error);
      throw createAppError('Failed to retrieve created project', 500);
    }

    const project = projectResult.data[0];
    console.log('8. Project created successfully:', { 
      projectId: project.project_id, 
      name: project.name, 
      owner: project.owner_name, 
      manager: project.manager_name 
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        projectId: project.project_id,
        ownerID: project.owner_id,
        managerID: project.manager_id,
        name: project.name,
        deadline: project.deadline,
        priority: project.priority,
        status: project.status,
        description: project.description,
        ownerName: project.owner_name,
        managerName: project.manager_name,
        createdAt: project.created_at
      }
    });

  } catch (error) {
    console.error('Project creation error:', error);
    if (error.statusCode) {
      throw error; // Re-throw custom errors
    }
    throw createAppError('Failed to create project', 500);
  }
});

/**
 * Get project by ID
 * GET /api/v1/projects/:projectId
 */
const getProjectById = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const project = await Project.findById(projectId, userId);
  
  if (!project) {
    throw createAppError('Project not found or access denied', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      project
    }
  });
});

/**
 * Update project
 * PUT /api/v1/projects/:projectId
 */
const updateProject = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  try {
    const project = await Project.update(projectId, updateData, userId);
    
    if (!project) {
      throw createAppError('Project not found or no changes made', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project
      }
    });
  } catch (error) {
    if (error.message === 'Permission denied') {
      throw createAppError('Permission denied', 403);
    }
    throw error;
  }
});

/**
 * Delete project
 * DELETE /api/v1/projects/:projectId
 */
const deleteProject = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const success = await Project.delete(projectId, userId);
    
    if (!success) {
      throw createAppError('Failed to delete project', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      throw createAppError('Project not found', 404);
    }
    if (error.message.includes('Only project owner')) {
      throw createAppError('Only project owner can delete the project', 403);
    }
    throw error;
  }
});

/**
 * Get project members
 * GET /api/v1/projects/:projectId/members
 */
const getProjectMembers = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const members = await Project.getMembers(projectId, userId);

    res.status(200).json({
      success: true,
      data: {
        members
      }
    });
  } catch (error) {
    if (error.message === 'Access denied') {
      throw createAppError('Access denied', 403);
    }
    throw error;
  }
});

/**
 * Add project member
 * POST /api/v1/projects/:projectId/members
 */
const addProjectMember = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const memberData = req.body;

  try {
    const success = await Project.addMember(projectId, memberData, userId);
    
    if (!success) {
      throw createAppError('Failed to add member', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Member added successfully'
    });
  } catch (error) {
    if (error.message === 'Permission denied') {
      throw createAppError('Permission denied', 403);
    }
    if (error.message === 'User not found or inactive') {
      throw createAppError('User not found or inactive', 404);
    }
    if (error.message === 'User is already a project member') {
      throw createAppError('User is already a project member', 400);
    }
    throw error;
  }
});

/**
 * Update member role
 * PUT /api/v1/projects/:projectId/members/:userId
 */
const updateMemberRole = asyncErrorHandler(async (req, res) => {
  const { projectId, userId: memberId } = req.params;
  const userId = req.user.id;
  const { role } = req.body;

  try {
    const success = await Project.updateMemberRole(projectId, memberId, role, userId);
    
    if (!success) {
      throw createAppError('Failed to update member role', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    if (error.message === 'Permission denied') {
      throw createAppError('Permission denied', 403);
    }
    if (error.message === 'Cannot change project owner role') {
      throw createAppError('Cannot change project owner role', 400);
    }
    throw error;
  }
});

/**
 * Remove member
 * DELETE /api/v1/projects/:projectId/members/:userId
 */
const removeMember = asyncErrorHandler(async (req, res) => {
  const { projectId, userId: memberId } = req.params;
  const userId = req.user.id;

  try {
    const success = await Project.removeMember(projectId, memberId, userId);
    
    if (!success) {
      throw createAppError('Failed to remove member', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    if (error.message === 'Permission denied') {
      throw createAppError('Permission denied', 403);
    }
    if (error.message === 'Cannot remove project owner') {
      throw createAppError('Cannot remove project owner', 400);
    }
    throw error;
  }
});

/**
 * Leave project
 * POST /api/v1/projects/:projectId/leave
 */
const leaveProject = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const success = await Project.leave(projectId, userId);
    
    if (!success) {
      throw createAppError('Failed to leave project', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully left project'
    });
  } catch (error) {
    if (error.message === 'Project owner cannot leave the project') {
      throw createAppError('Project owner cannot leave the project', 400);
    }
    throw error;
  }
});

/**
 * Get project statistics
 * GET /api/v1/projects/:projectId/stats
 */
const getProjectStats = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const stats = await Project.getStats(projectId, userId);

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    if (error.message === 'Access denied') {
      throw createAppError('Access denied', 403);
    }
    throw error;
  }
});

module.exports = {
  getUserProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeMember,
  leaveProject,
  getProjectStats
};
