const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');

// API version prefix
const API_VERSION = '/api/v1';

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SynergySphere API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Documentation route
router.get('/docs', (req, res) => {
  res.status(200).json({
    message: 'SynergySphere API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      projects: `${API_VERSION}/projects`,
      tasks: `${API_VERSION}/tasks`,
      notifications: `${API_VERSION}/notifications`,
      admin: `${API_VERSION}/admin`
    },
    documentation: 'https://docs.synergyphere.com'
  });
});

// Mount route modules with API version prefix
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/projects`, projectRoutes);
router.use(`${API_VERSION}/tasks`, taskRoutes);
router.use(`${API_VERSION}/notifications`, notificationRoutes);
router.use(`${API_VERSION}/admin`, adminRoutes);

module.exports = router;
