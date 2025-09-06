const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');

// Task routes
/**
 * GET /tasks
 * Get all tasks for the authenticated user
 * Query: ?status=pending&priority=high&limit=10&offset=0&projectId=123
 */
router.get('/', authenticate, taskController.getUserTasks);

/**
 * GET /projects/:projectId/tasks
 * Get all tasks for a specific project
 * Query: ?status=completed&assigneeId=123&limit=10&offset=0
 */
router.get('/projects/:projectId/tasks', authenticate, taskController.getProjectTasks);

/**
 * POST /projects/:projectId/tasks
 * Create a new task in a project
 * Body: { title, description, dueDate, priority, assigneeId, tags }
 */
router.post('/projects/:projectId/tasks', authenticate, validateTask, taskController.createTask);

/**
 * GET /tasks/:taskId
 * Get details of a specific task
 */
router.get('/:taskId', authenticate, taskController.getTaskById);

/**
 * PUT /tasks/:taskId
 * Update a task
 * Body: { title, description, dueDate, priority, status, assigneeId, tags }
 */
router.put('/:taskId', authenticate, validateTask, taskController.updateTask);

/**
 * DELETE /tasks/:taskId
 * Delete a task
 */
router.delete('/:taskId', authenticate, taskController.deleteTask);

/**
 * PUT /tasks/:taskId/status
 * Update task status only
 * Body: { status }
 */
router.put('/:taskId/status', authenticate, taskController.updateTaskStatus);

/**
 * PUT /tasks/:taskId/assign
 * Assign task to a user
 * Body: { assigneeId }
 */
router.put('/:taskId/assign', authenticate, taskController.assignTask);

/**
 * POST /tasks/:taskId/comments
 * Add a comment to a task
 * Body: { content }
 */
router.post('/:taskId/comments', authenticate, taskController.addTaskComment);

/**
 * GET /tasks/:taskId/comments
 * Get all comments for a task
 */
router.get('/:taskId/comments', authenticate, taskController.getTaskComments);

/**
 * PUT /tasks/:taskId/comments/:commentId
 * Update a task comment
 * Body: { content }
 */
router.put('/:taskId/comments/:commentId', authenticate, taskController.updateTaskComment);

/**
 * DELETE /tasks/:taskId/comments/:commentId
 * Delete a task comment
 */
router.delete('/:taskId/comments/:commentId', authenticate, taskController.deleteTaskComment);

/**
 * POST /tasks/bulk-update
 * Bulk update multiple tasks
 * Body: { taskIds: [], updates: { status, assigneeId, priority } }
 */
router.post('/bulk-update', authenticate, taskController.bulkUpdateTasks);

module.exports = router;
