const Project = require('../models/Project');
const User = require('../models/User');
const { asyncErrorHandler, createAppError } = require('../middleware/errorHandler');

/**
 * Project Controller
 * Handles project-related operations
 */

/**
 * Get user's projects
 * GET /api/v1/projects
 */
const getUserProjects = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, search, limit = 20, offset = 0 } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (search) filters.search = search;

  const projects = await Project.getUserProjects(userId, filters, parseInt(limit), parseInt(offset));

  res.status(200).json({
    success: true,
    data: {
      projects,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: projects.length
      }
    }
  });
});

/**
 * Create a new project
 * POST /api/v1/projects
 */
const createProject = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const projectData = req.body;

  const project = await Project.create(projectData, userId);
  
  if (!project) {
    throw createAppError('Failed to create project', 500);
  }

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: {
      project
    }
  });
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
