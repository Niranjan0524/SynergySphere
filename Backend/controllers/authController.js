const { executeQuery } = require('../models/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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

  console.log('Registration attempt:', { name, email, password: '***' });

  // Validate required fields
  if (!name || !email || !password) {
    console.log('Validation failed - missing fields');
    throw createAppError('Name, email, and password are required', 400);
  }

  try {
    console.log('1. Creating Users table if not exists...');
    // First, ensure the Users table exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;
    
    const tableResult = await executeQuery(createTableQuery);
    console.log('Table creation result:', tableResult.success ? 'SUCCESS' : tableResult.error);

    console.log('2. Checking if user already exists...');
    // Check if user already exists
    const checkUserQuery = 'SELECT user_id FROM Users WHERE email = ?';
    const existingUser = await executeQuery(checkUserQuery, [email]);
    console.log('Existing user check result:', existingUser.success ? 'SUCCESS' : existingUser.error);
    
    if (existingUser.success && existingUser.data.length > 0) {
      console.log('User already exists');
      throw createAppError('User with this email already exists', 400);
    }

    console.log('3. Hashing password...');
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    console.log('4. Creating new user...');
    // Create new user
    const createUserQuery = `
      INSERT INTO Users (name, email, password) 
      VALUES (?, ?, ?)
    `;
    
    const result = await executeQuery(createUserQuery, [name, email, hashedPassword]);
    console.log('User creation result:', result.success ? `SUCCESS - ID: ${result.data.insertId}` : result.error);
    
    if (!result.success) {
      console.error('Database error during user creation:', result.error);
      throw createAppError('Failed to create user', 500);
    }

    console.log('5. Retrieving created user...');
    // Get the created user
    const getUserQuery = 'SELECT user_id, name, email FROM Users WHERE user_id = ?';
    const userResult = await executeQuery(getUserQuery, [result.data.insertId]);
    console.log('User retrieval result:', userResult.success ? 'SUCCESS' : userResult.error);
    
    if (!userResult.success || userResult.data.length === 0) {
      console.error('Failed to retrieve created user:', userResult.error);
      throw createAppError('Failed to retrieve created user', 500);
    }

    const user = userResult.data[0];
    console.log('6. User created successfully:', { userId: user.user_id, name: user.name, email: user.email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.user_id,
        userName: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.statusCode) {
      throw error; // Re-throw custom errors
    }
    throw createAppError('Failed to create user', 500);
  }
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw createAppError('Email and password are required', 400);
  }

  try {
    // Find user by email (including password for verification)
    const findUserQuery = 'SELECT user_id, name, email, password FROM Users WHERE email = ?';
    const userResult = await executeQuery(findUserQuery, [email]);
    
    if (!userResult.success || userResult.data.length === 0) {
      throw createAppError('Invalid email or password', 401);
    }

    const user = userResult.data[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createAppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user.user_id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        userId: user.user_id,
        userName: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    if (error.statusCode) {
      throw error; // Re-throw custom errors
    }
    throw createAppError('Login failed', 500);
  }
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

  try {
    // Find user by email
    const findUserQuery = 'SELECT user_id, name FROM Users WHERE email = ?';
    const userResult = await executeQuery(findUserQuery, [email]);
    
    if (!userResult.success || userResult.data.length === 0) {
      // Don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    const user = userResult.data[0];

    // Generate reset token
    const resetToken = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  }
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
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password in database
    const updatePasswordQuery = 'UPDATE Users SET password = ? WHERE user_id = ?';
    const result = await executeQuery(updatePasswordQuery, [hashedPassword, decoded.id]);
    
    if (!result.success) {
      throw createAppError('Failed to update password', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createAppError('Invalid or expired reset token', 400);
    }
    if (error.statusCode) {
      throw error;
    }
    throw createAppError('Failed to reset password', 500);
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
