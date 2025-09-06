const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { validateProject, validateProjectCreation, validateProjectMember } = require('../middleware/validation');

// Project routes
/**
 * GET /projects
 * Get all projects for a user
 * Query: ?userId=1&limit=10&offset=0&status=active
 */
router.get('/getProjects/:userId', projectController.getUserProjects);

/**
 * POST /projects
 * Create a new project
 * Body: { ownerID, managerID, name, deadline, priority, status, description }
 */
router.post('/', validateProjectCreation, projectController.createProject);

/**
 * GET /projects/:projectId
 * Get project details including members and tasks
 */
router.get('/:projectId', authenticate, projectController.getProjectById);

/**
 * PUT /projects/:projectId
 * Update project information
 * Body: { name, description, deadline, status, isPrivate }
 */
router.put('/:projectId', authenticate, validateProject, projectController.updateProject);

/**
 * DELETE /projects/:projectId
 * Delete a project (only by project owner)
 */
router.delete('/:projectId', authenticate, projectController.deleteProject);

// Project Members routes
/**
 * GET /projects/:projectId/members
 * Get all members of a project
 */
router.get('/:projectId/members', authenticate, projectController.getProjectMembers);

/**
 * POST /projects/:projectId/members
 * Add a member to the project
 * Body: { userId } or { email }
 */
router.post('/:projectId/members', authenticate, validateProjectMember, projectController.addProjectMember);

/**
 * PUT /projects/:projectId/members/:userId
 * Update member role in project
 * Body: { role }
 */
router.put('/:projectId/members/:userId', authenticate, projectController.updateMemberRole);

/**
 * DELETE /projects/:projectId/members/:userId
 * Remove a member from the project
 */
router.delete('/:projectId/members/:userId', authenticate, projectController.removeMember);

/**
 * POST /projects/:projectId/leave
 * Leave a project (for members)
 */
router.post('/:projectId/leave', authenticate, projectController.leaveProject);

// Project Statistics routes
/**
 * GET /projects/:projectId/stats
 * Get project statistics (task completion, member activity, etc.)
 */
router.get('/:projectId/stats', authenticate, projectController.getProjectStats);

module.exports = router;
