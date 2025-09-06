const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

/**
 * User registration validation
 */
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 4, max: 100 })
    .withMessage('Password must be at least 4 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

/**
 * User login validation
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * User update validation
 */
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  handleValidationErrors
];

/**
 * Project creation validation
 */
const validateProjectCreation = [
  body('ownerID')
    .isInt({ min: 1 })
    .withMessage('ownerID must be a valid positive integer'),
  body('managerID')
    .isInt({ min: 1 })
    .withMessage('managerID must be a valid positive integer'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Project name must be between 3 and 200 characters'),
  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .custom((value) => {
      // Try to parse the date
      const deadlineDate = new Date(value);
      
      // Check if it's a valid date
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('Please provide a valid deadline date');
      }
      
      // Check if deadline is in the future
      const now = new Date();
      if (deadlineDate <= now) {
        throw new Error('Deadline must be in the future');
      }
      
      return true;
    }),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('status')
    .isIn(['waiting', 'progress', 'completed'])
    .withMessage('Status must be one of: waiting, progress, completed'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  handleValidationErrors
];

/**
 * Project validation (legacy - keeping for backward compatibility)
 */
const validateProject = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid deadline date'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value'),
  handleValidationErrors
];

/**
 * Project member validation
 */
const validateProjectMember = [
  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['member', 'admin', 'viewer'])
    .withMessage('Role must be one of: member, admin, viewer'),
  // Ensure either userId or email is provided
  body().custom((body) => {
    if (!body.userId && !body.email) {
      throw new Error('Either userId or email must be provided');
    }
    return true;
  }),
  handleValidationErrors
];

/**
 * Task validation
 */
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Task title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in_progress, completed, cancelled'),
  body('assigneeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be 0 or greater'),
  handleValidationErrors
];

/**
 * ID parameter validation
 */
const validateIdParam = (paramName = 'id') => [
  param(paramName)
    .isInt({ min: 1 })
    .withMessage(`${paramName} must be a positive integer`),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateUserUpdate,
  validateProject,
  validateProjectCreation,
  validateProjectMember,
  validateTask,
  validatePagination,
  validateIdParam
};
