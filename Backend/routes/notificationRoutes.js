const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Notification routes
/**
 * GET /notifications
 * Get all notifications for the authenticated user
 * Query: ?unread=true&limit=20&offset=0&type=task_assigned
 */
router.get('/', authenticate, notificationController.getUserNotifications);

/**
 * POST /notifications/mark-read
 * Mark specific notifications as read
 * Body: { notificationIds: [1, 2, 3] }
 */
router.post('/mark-read', authenticate, notificationController.markNotificationsRead);

/**
 * POST /notifications/mark-all-read
 * Mark all notifications as read for the user
 */
router.post('/mark-all-read', authenticate, notificationController.markAllNotificationsRead);

/**
 * GET /notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

/**
 * DELETE /notifications/:notificationId
 * Delete a specific notification
 */
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

/**
 * POST /notifications/preferences
 * Update notification preferences
 * Body: { emailNotifications, pushNotifications, taskAssigned, taskCompleted, projectInvite, etc. }
 */
router.post('/preferences', authenticate, notificationController.updateNotificationPreferences);

/**
 * GET /notifications/preferences
 * Get user's notification preferences
 */
router.get('/preferences', authenticate, notificationController.getNotificationPreferences);

/**
 * POST /notifications/test
 * Send a test notification (development/admin only)
 * Body: { userId, type, message }
 */
router.post('/test', authenticate, notificationController.sendTestNotification);

module.exports = router;
