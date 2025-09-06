const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { asyncErrorHandler, createAppError } = require('../middleware/errorHandler');

/**
 * Authentication Controller
 * Handles user registration, login, and authentication-related operations
 */

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = asyncErrorHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw createAppError('User with this email already exists', 400);
  }

  // Create new user
  const user = await User.create({ name, email, password });
  if (!user) {
    throw createAppError('Failed to create user', 500);
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  delete user.password_hash;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token
    }
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email (including password for verification)
  const user = await User.findByEmail(email);
  if (!user) {
    throw createAppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw createAppError('Account is inactive or suspended', 401);
  }

  // Verify password
  const isValidPassword = await User.verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    throw createAppError('Invalid email or password', 401);
  }

  // Update last login
  await User.updateLastLogin(user.id);

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  delete user.password_hash;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token
    }
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Refresh token
 * POST /api/v1/auth/refresh
 */
const refreshToken = asyncErrorHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw createAppError('Refresh token required', 400);
  }

  try {
    // Verify refresh token (implement refresh token logic as needed)
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Generate new access token
    const newToken = generateToken(decoded.id);
    
    res.status(200).json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    throw createAppError('Invalid refresh token', 401);
  }
});

/**
 * Forgot password
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncErrorHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists or not
    return res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  // TODO: Send email with reset link
  console.log(`Password reset token for ${email}: ${resetToken}`);

  res.status(200).json({
    success: true,
    message: 'If the email exists, a password reset link has been sent'
  });
});

/**
 * Reset password
 * POST /api/v1/auth/reset-password
 */
const resetPassword = asyncErrorHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Update password
    const success = await User.updatePassword(decoded.id, newPassword);
    if (!success) {
      throw createAppError('Failed to update password', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createAppError('Invalid or expired reset token', 400);
    }
    throw error;
  }
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};
