const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validation');

// User routes
/**
 * GET /users/me
 * Get current user profile (requires authentication)
 */
router.get('/me', authenticate, userController.getCurrentUser);

/**
 * PUT /users/me
 * Update current user profile
 * Body: { name, email, bio, avatar, etc. }
 */
router.put('/me', authenticate, validateUserUpdate, userController.updateCurrentUser);

/**
 * DELETE /users/me
 * Delete current user account
 */
router.delete('/me', authenticate, userController.deleteCurrentUser);

/**
 * GET /users/:userId
 * Get user profile by ID (public info only)
 */
router.get('/:userId', userController.getUserById);

/**
 * GET /users/search
 * Search users by name or email
 * Query: ?q=searchTerm&limit=10&offset=0
 */
router.get('/search', authenticate, userController.searchUsers);

/**
 * PUT /users/change-password
 * Change user password
 * Body: { currentPassword, newPassword }
 */
router.put('/change-password', authenticate, userController.changePassword);

module.exports = router;
