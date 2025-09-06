const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Admin routes - all require authentication and admin privileges
/**
 * GET /admin/users
 * Get all users (admin only)
 * Query: ?active=true&limit=50&offset=0&search=john
 */
router.get('/users', authenticate, requireAdmin, adminController.getAllUsers);

/**
 * PUT /admin/users/:userId/status
 * Update user status (activate/deactivate)
 * Body: { status: 'active' | 'inactive' | 'suspended' }
 */
router.put('/users/:userId/status', authenticate, requireAdmin, adminController.updateUserStatus);

/**
 * GET /admin/projects
 * Get all projects (admin only)
 * Query: ?status=active&limit=50&offset=0
 */
router.get('/projects', authenticate, requireAdmin, adminController.getAllProjects);

/**
 * DELETE /admin/projects/:projectId
 * Force delete a project (admin only)
 */
router.delete('/projects/:projectId', authenticate, requireAdmin, adminController.forceDeleteProject);

/**
 * GET /admin/stats
 * Get system statistics
 */
router.get('/stats', authenticate, requireAdmin, adminController.getSystemStats);

/**
 * GET /admin/activity-logs
 * Get system activity logs
 * Query: ?limit=100&offset=0&userId=123&action=login
 */
router.get('/activity-logs', authenticate, requireAdmin, adminController.getActivityLogs);

/**
 * POST /admin/broadcast
 * Send broadcast notification to all users
 * Body: { message, type, urgent }
 */
router.post('/broadcast', authenticate, requireAdmin, adminController.sendBroadcastNotification);

/**
 * GET /admin/database-health
 * Check database health and performance metrics
 */
router.get('/database-health', authenticate, requireAdmin, adminController.getDatabaseHealth);

/**
 * POST /admin/backup
 * Trigger database backup (if implemented)
 */
router.post('/backup', authenticate, requireAdmin, adminController.triggerBackup);

module.exports = router;
