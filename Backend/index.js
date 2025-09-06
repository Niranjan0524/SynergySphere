require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { testConnection, verifyDatabaseStructure } = require('./models/database');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import individual routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SynergySphere API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes directly
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handling middleware
app.use(globalErrorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      // Verify database structure (check if required tables exist)
      await verifyDatabaseStructure();
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 SynergySphere Backend Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(` API Base URL: http://localhost:${PORT}`);
      console.log(`🗄️  Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 Available routes: /auth, /users, /projects, /tasks, /notifications, /admin`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
