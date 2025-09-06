const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { asyncErrorHandler, createAppError } = require('../middleware/errorHandler');

/**
 * User Controller
 * Handles user profile and account management operations
 */

/**
 * Get current user profile
 * GET /api/v1/users/me
 */
const getCurrentUser = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findById(userId);
  if (!user) {
    throw createAppError('User not found', 404);
  }

  // Remove password from response
  delete user.password_hash;

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * Update current user profile
 * PUT /api/v1/users/me
 */
const updateCurrentUser = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  // Remove sensitive fields that shouldn't be updated via this endpoint
  delete updates.password;
  delete updates.password_hash;
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;

  const updatedUser = await User.update(userId, updates);
  if (!updatedUser) {
    throw createAppError('Failed to update user profile', 500);
  }

  // Remove password from response
  delete updatedUser.password_hash;

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Delete current user account
 * DELETE /api/v1/users/me
 */
const deleteCurrentUser = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;

  const success = await User.delete(userId);
  if (!success) {
    throw createAppError('Failed to delete user account', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * Get user profile by ID (public info only)
 * GET /api/v1/users/:userId
 */
const getUserById = asyncErrorHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw createAppError('User not found', 404);
  }

  // Return only public information
  const publicUser = {
    id: user.id,
    name: user.name,
    bio: user.bio || null,
    avatar: user.avatar_url || null,
    created_at: user.created_at
  };

  res.status(200).json({
    success: true,
    data: {
      user: publicUser
    }
  });
});

/**
 * Search users by name or email
 * GET /api/v1/users/search
 */
const searchUsers = asyncErrorHandler(async (req, res) => {
  const { q: searchTerm, limit = 10, offset = 0 } = req.query;

  if (!searchTerm) {
    throw createAppError('Search term is required', 400);
  }

  const users = await User.search(searchTerm, parseInt(limit), parseInt(offset));

  // Return only public information
  const publicUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio || null,
    avatar: user.avatar_url || null,
    created_at: user.created_at
  }));

  res.status(200).json({
    success: true,
    data: {
      users: publicUsers,
      count: publicUsers.length
    }
  });
});

/**
 * Change user password
 * PUT /api/v1/users/change-password
 */
const changePassword = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createAppError('Current password and new password are required', 400);
  }

  // Verify current password
  const user = await User.findById(userId);
  if (!user) {
    throw createAppError('User not found', 404);
  }

  // Get the full user data including password hash
  const fullUser = await User.findByEmail(user.email);
  const isCurrentPasswordValid = await User.verifyPassword(currentPassword, fullUser.password_hash);
  if (!isCurrentPasswordValid) {
    throw createAppError('Current password is incorrect', 400);
  }

  // Update password
  const success = await User.updatePassword(userId, newPassword);
  if (!success) {
    throw createAppError('Failed to update password', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getUserById,
  searchUsers,
  changePassword
};
