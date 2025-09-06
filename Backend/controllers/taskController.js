const Task = require('../models/Task');
const { asyncErrorHandler, createAppError } = require('../middleware/errorHandler');

/**
 * Task Controller
 * Handles task-related operations
 */

/**
 * Get all tasks for the authenticated user
 * GET /api/v1/tasks
 */
const getUserTasks = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, priority, limit = 20, offset = 0, projectId } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (projectId) filters.project_id = projectId;

  const tasks = await Task.getUserTasks(userId, filters, parseInt(limit), parseInt(offset));

  res.status(200).json({
    success: true,
    data: {
      tasks,
      count: tasks.length
    }
  });
});

/**
 * Get all tasks for a specific project
 * GET /api/v1/projects/:projectId/tasks
 */
const getProjectTasks = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { projectId } = req.params;
  const { status, assigneeId, limit = 50, offset = 0, priority } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (assigneeId) filters.assignee_id = assigneeId;
  if (priority) filters.priority = priority;

  const tasks = await Task.getProjectTasks(projectId, userId, filters, parseInt(limit), parseInt(offset));

  res.status(200).json({
    success: true,
    data: {
      tasks,
      count: tasks.length
    }
  });
});

/**
 * Create a new task in a project
 * POST /api/v1/projects/:projectId/tasks
 */
const createTask = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { projectId } = req.params;
  const { title, description, dueDate, priority, assigneeId, tags } = req.body;

  const taskData = {
    project_id: projectId,
    title,
    description,
    due_date: dueDate,
    priority: priority || 'medium',
    assignee_id: assigneeId
  };

  const task = await Task.create(taskData, userId);
  if (!task) {
    throw createAppError('Failed to create task', 500);
  }

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: {
      task
    }
  });
});

/**
 * Get details of a specific task
 * GET /api/v1/tasks/:taskId
 */
const getTaskById = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { taskId } = req.params;

  const task = await Task.findById(taskId, userId);
  if (!task) {
    throw createAppError('Task not found or access denied', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      task
    }
  });
});

/**
 * Update a task
 * PUT /api/v1/tasks/:taskId
 */
const updateTask = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { taskId } = req.params;
  const updates = req.body;

  // Remove fields that shouldn't be updated directly
  delete updates.id;
  delete updates.created_by;
  delete updates.created_at;
  delete updates.updated_at;
  delete updates.project_id;

  const updatedTask = await Task.update(taskId, updates, userId);
  if (!updatedTask) {
    throw createAppError('Failed to update task', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: {
      task: updatedTask
    }
  });
});

/**
 * Delete a task
 * DELETE /api/v1/tasks/:taskId
 */
const deleteTask = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { taskId } = req.params;

  const success = await Task.delete(taskId, userId);
  if (!success) {
    throw createAppError('Failed to delete task', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});

/**
 * Update task status only
 * PUT /api/v1/tasks/:taskId/status
 */
const updateTaskStatus = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { taskId } = req.params;
  const { status } = req.body;

  if (!status) {
    throw createAppError('Status is required', 400);
  }

  const success = await Task.updateStatus(taskId, status, userId);
  if (!success) {
    throw createAppError('Failed to update task status', 500);
  }

  // Get updated task
  const updatedTask = await Task.findById(taskId, userId);

  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: {
      task: updatedTask
    }
  });
});

/**
 * Assign task to a user
 * PUT /api/v1/tasks/:taskId/assign
 */
const assignTask = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { taskId } = req.params;
  const { assigneeId } = req.body;

  const updatedTask = await Task.assign(taskId, assigneeId, userId);
  if (!updatedTask) {
    throw createAppError('Failed to assign task', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Task assigned successfully',
    data: {
      task: updatedTask
    }
  });
});

/**
 * Add a comment to a task (placeholder - requires comment model)
 * POST /api/v1/tasks/:taskId/comments
 */
const addTaskComment = asyncErrorHandler(async (req, res) => {
  // This would require a TaskComment model which doesn't exist yet
  throw createAppError('Task comments feature not implemented yet', 501);
});

/**
 * Get all comments for a task (placeholder - requires comment model)
 * GET /api/v1/tasks/:taskId/comments
 */
const getTaskComments = asyncErrorHandler(async (req, res) => {
  // This would require a TaskComment model which doesn't exist yet
  throw createAppError('Task comments feature not implemented yet', 501);
});

/**
 * Update a task comment (placeholder - requires comment model)
 * PUT /api/v1/tasks/:taskId/comments/:commentId
 */
const updateTaskComment = asyncErrorHandler(async (req, res) => {
  // This would require a TaskComment model which doesn't exist yet
  throw createAppError('Task comments feature not implemented yet', 501);
});

/**
 * Delete a task comment (placeholder - requires comment model)
 * DELETE /api/v1/tasks/:taskId/comments/:commentId
 */
const deleteTaskComment = asyncErrorHandler(async (req, res) => {
  // This would require a TaskComment model which doesn't exist yet
  throw createAppError('Task comments feature not implemented yet', 501);
});

/**
 * Bulk update multiple tasks
 * POST /api/v1/tasks/bulk-update
 */
const bulkUpdateTasks = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { taskIds, updates } = req.body;

  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    throw createAppError('Task IDs array is required', 400);
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw createAppError('Updates object is required', 400);
  }

  const success = await Task.bulkUpdate(taskIds, updates, userId);
  if (!success) {
    throw createAppError('Failed to bulk update tasks', 500);
  }

  res.status(200).json({
    success: true,
    message: `Successfully updated ${taskIds.length} tasks`
  });
});

module.exports = {
  getUserTasks,
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  addTaskComment,
  getTaskComments,
  updateTaskComment,
  deleteTaskComment,
  bulkUpdateTasks
};
