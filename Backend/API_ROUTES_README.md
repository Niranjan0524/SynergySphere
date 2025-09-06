# SynergySphere Backend API Router Structure

## Overview

This backend follows a modular architecture with clear separation of concerns:

- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle business logic and data processing
- **Middleware**: Handle authentication, validation, error handling
- **Models**: Database interactions and data management
- **Utils**: Helper functions and utilities

## API Structure

All routes are prefixed with `/api/v1` and follow RESTful conventions.

### Authentication Routes (`/api/v1/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Send password reset email
- `POST /auth/reset-password` - Reset password with token

### User Routes (`/api/v1/users`)
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `DELETE /users/me` - Delete current user account
- `GET /users/:userId` - Get user profile by ID
- `GET /users/search` - Search users
- `PUT /users/change-password` - Change password

### Project Routes (`/api/v1/projects`)
- `GET /projects` - Get user's projects
- `POST /projects` - Create new project
- `GET /projects/:projectId` - Get project details
- `PUT /projects/:projectId` - Update project
- `DELETE /projects/:projectId` - Delete project
- `GET /projects/:projectId/members` - Get project members
- `POST /projects/:projectId/members` - Add project member
- `PUT /projects/:projectId/members/:userId` - Update member role
- `DELETE /projects/:projectId/members/:userId` - Remove member
- `POST /projects/:projectId/leave` - Leave project
- `GET /projects/:projectId/stats` - Get project statistics

### Task Routes (`/api/v1/tasks`)
- `GET /tasks` - Get user's tasks
- `GET /projects/:projectId/tasks` - Get project tasks
- `POST /projects/:projectId/tasks` - Create new task
- `GET /tasks/:taskId` - Get task details
- `PUT /tasks/:taskId` - Update task
- `DELETE /tasks/:taskId` - Delete task
- `PUT /tasks/:taskId/status` - Update task status
- `PUT /tasks/:taskId/assign` - Assign task
- `POST /tasks/:taskId/comments` - Add task comment
- `GET /tasks/:taskId/comments` - Get task comments
- `POST /tasks/bulk-update` - Bulk update tasks

### Message Routes (`/api/v1/messages`)
- `GET /projects/:projectId/messages` - Get project messages
- `POST /projects/:projectId/messages` - Create message
- `GET /messages/:messageId` - Get message details
- `PUT /messages/:messageId` - Update message
- `DELETE /messages/:messageId` - Delete message
- `GET /messages/:messageId/replies` - Get message replies
- `POST /messages/:messageId/reactions` - Add reaction
- `DELETE /messages/:messageId/reactions` - Remove reaction
- `POST /messages/:messageId/pin` - Pin message
- `DELETE /messages/:messageId/pin` - Unpin message

### Notification Routes (`/api/v1/notifications`)
- `GET /notifications` - Get user notifications
- `POST /notifications/mark-read` - Mark notifications as read
- `POST /notifications/mark-all-read` - Mark all as read
- `GET /notifications/unread-count` - Get unread count
- `DELETE /notifications/:notificationId` - Delete notification
- `POST /notifications/preferences` - Update notification preferences
- `GET /notifications/preferences` - Get notification preferences

### Upload Routes (`/api/v1/upload`)
- `POST /upload/avatar` - Upload user avatar
- `POST /upload/project/:projectId/files` - Upload project files
- `POST /upload/task/:taskId/attachments` - Upload task attachments
- `POST /upload/message/:messageId/media` - Upload message media
- `GET /upload/files/:fileId` - Download file
- `DELETE /upload/files/:fileId` - Delete file

### Admin Routes (`/api/v1/admin`) - Admin Only
- `GET /admin/users` - Get all users
- `PUT /admin/users/:userId/status` - Update user status
- `GET /admin/projects` - Get all projects
- `DELETE /admin/projects/:projectId` - Force delete project
- `GET /admin/stats` - Get system statistics
- `GET /admin/activity-logs` - Get activity logs
- `POST /admin/broadcast` - Send broadcast notification

## Middleware

### Authentication Middleware
- `authenticate` - Verifies JWT token and populates `req.user`
- `requireAdmin` - Ensures user has admin role
- `requireProjectMember` - Ensures user is project member
- `requireProjectAdmin` - Ensures user is project admin

### Validation Middleware
- `validateRegistration` - Validates user registration data
- `validateLogin` - Validates login credentials
- `validateProject` - Validates project data
- `validateTask` - Validates task data
- `validateMessage` - Validates message content
- `validateFileUpload` - Validates file uploads

### Error Handling
- Global error handler with development/production modes
- Async error wrapper for catching promise rejections
- Custom application error class
- 404 handler for unmatched routes

## Database Schema

The system uses MySQL with the following main tables:

- `users` - User accounts and profiles
- `projects` - Project information
- `project_members` - Many-to-many relationship between users and projects
- `tasks` - Task management within projects
- `messages` - Project messaging and discussions
- `notifications` - User notifications

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```env
   PORT=5000
   HOST=localhost
   DB_PORT=3306
   USER=your_db_user
   PASSWORD=your_db_password
   DATABASE=synergyphere
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

4. The database tables will be created automatically on first run.

## API Testing

- Health Check: `GET /health`
- API Documentation: `GET /docs`
- All API endpoints are under `/api/v1`

## Architecture Benefits

1. **Modular Structure**: Easy to maintain and extend
2. **Clear Separation**: Routes, controllers, middleware, and models are separate
3. **Scalable**: Easy to add new features and endpoints
4. **Secure**: Built-in authentication, validation, and error handling
5. **RESTful**: Follows REST conventions for predictable API design
6. **Error Handling**: Comprehensive error handling with proper HTTP status codes
7. **Validation**: Input validation on all endpoints
8. **File Uploads**: Support for file attachments and media uploads
