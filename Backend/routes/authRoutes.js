const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Authentication routes
/**
 * POST /auth/register
 * Register a new user
 * Body: { name, email, password }
 */
router.post('/register', validateRegistration, authController.register);

/**
 * POST /auth/login  
 * Authenticate user and return JWT
 * Body: { email, password }
 */
router.post('/login', validateLogin, authController.login);

/**
 * POST /auth/logout
 * Logout user (if using sessions/refresh tokens)
 */
router.post('/logout', authController.logout);

/**
 * POST /auth/refresh
 * Refresh JWT token using refresh token
 * Body: { refreshToken }
 */
router.post('/refresh', authController.refreshToken);

/**
 * POST /auth/forgot-password
 * Send password reset email
 * Body: { email }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /auth/reset-password
 * Reset password using token
 * Body: { token, newPassword }
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
