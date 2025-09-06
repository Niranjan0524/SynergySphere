const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token - user not found'
      });
    }

    if (user.status === 'inactive' || user.status === 'suspended') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Account is inactive or suspended'
      });
    }

    req.user = {
      id: user.user_id,
      role: user.role,
      email: user.email,
      name: user.name
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Admin authorization middleware - requires admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access forbidden',
      message: 'Admin privileges required'
    });
  }
  next();
};

/**
 * Project member authorization middleware - checks if user is a member of the project
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the project
    const isMember = await User.isProjectMember(userId, projectId);
    
    if (!isMember) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You are not a member of this project'
      });
    }
    
    next();
  } catch (error) {
    console.error('Project authorization error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Authorization check failed'
    });
  }
};

/**
 * Project admin authorization middleware - checks if user is admin/owner of the project
 */
const requireProjectAdmin = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user is admin/owner of the project
    const isAdmin = await User.isProjectAdmin(userId, projectId);
    
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'Project admin privileges required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Project admin authorization error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Authorization check failed'
    });
  }
};

/**
 * Rate limiting middleware - optional, can be enhanced with redis
 */
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const identifier = req.ip + (req.user ? req.user.id : '');
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    requests.forEach((timestamp, key) => {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    });

    // Count requests for this identifier
    const userRequests = Array.from(requests.entries())
      .filter(([key, timestamp]) => key.startsWith(identifier) && timestamp >= windowStart);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000}s`
      });
    }

    requests.set(`${identifier}-${now}`, now);
    next();
  };
};

module.exports = {
  authenticate,
  requireAdmin,
  requireProjectMember,
  requireProjectAdmin,
  rateLimiter
};
