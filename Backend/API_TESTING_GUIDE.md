# SynergySphere Backend - API Testing Guide

## Quick Start

1. **Setup the backend:**
   ```bash
   cd Backend
   node setup.js
   ```

2. **Update .env file** with your database credentials

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test API endpoints** using the examples below

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

### 1. Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}
```

## Projects (Authentication Required)

**Headers for all authenticated requests:**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Create Project
```http
POST /api/v1/projects
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "My First Project",
  "description": "This is a test project",
  "deadline": "2025-12-31",
  "is_private": false
}
```

### 4. Get User Projects
```http
GET /api/v1/projects?limit=10&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Get Project Details
```http
GET /api/v1/projects/1
Authorization: Bearer YOUR_JWT_TOKEN
```

### 6. Add Project Member
```http
POST /api/v1/projects/1/members
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "email": "member@example.com",
  "role": "member"
}
```

## Tasks

### 7. Create Task
```http
POST /api/v1/projects/1/tasks
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Implement user authentication",
  "description": "Set up JWT-based authentication system",
  "due_date": "2025-10-15",
  "priority": "high",
  "assignee_id": 2
}
```

### 8. Get User Tasks
```http
GET /api/v1/tasks?status=pending&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

### 9. Update Task Status
```http
PUT /api/v1/tasks/1/status
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "status": "in_progress"
}
```

## Messages

### 10. Send Message
```http
POST /api/v1/projects/1/messages
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "content": "Hey team! Let's discuss the project timeline."
}
```

### 11. Reply to Message
```http
POST /api/v1/projects/1/messages
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "content": "Great idea! I think we should start with the backend.",
  "parent_id": 1
}
```

## User Management

### 12. Get Current User Profile
```http
GET /api/v1/users/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### 13. Update Profile
```http
PUT /api/v1/users/me
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "John Smith",
  "bio": "Full-stack developer passionate about building great products"
}
```

## Notifications

### 14. Get Notifications
```http
GET /api/v1/notifications?unread=true
Authorization: Bearer YOUR_JWT_TOKEN
```

### 15. Mark Notifications as Read
```http
POST /api/v1/notifications/mark-read
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "notificationIds": [1, 2, 3]
}
```

## File Upload

### 16. Upload Avatar
```http
POST /api/v1/upload/avatar
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

Form Data:
- avatar: [image file]
```

### 17. Upload Project Files
```http
POST /api/v1/upload/project/1/files
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

Form Data:
- files: [multiple files]
```

## Error Responses

All error responses follow this format:
```json
{
  "error": "error_type",
  "message": "Human readable error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Testing with cURL

### Example: Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123"}'

# Login (save the token from response)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# Create project (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Test Project","description":"My test project"}'
```

## Testing with Postman

1. **Import Collection:**
   - Create a new collection in Postman
   - Add the base URL as a variable: `{{baseUrl}} = http://localhost:5000/api/v1`

2. **Set Authentication:**
   - After login, copy the JWT token
   - In Postman, go to Authorization tab
   - Select "Bearer Token" and paste your token

3. **Environment Variables:**
   ```
   baseUrl: http://localhost:5000/api/v1
   authToken: [your-jwt-token-here]
   ```

## Database Requirements

Make sure your database has these tables with sample data:

```sql
-- Users
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@synergyphere.com', '$2b$12$hashed_password', 'admin'),
('John Doe', 'john@example.com', '$2b$12$hashed_password', 'user'),
('Jane Smith', 'jane@example.com', '$2b$12$hashed_password', 'user');

-- Projects
INSERT INTO projects (name, description, created_by) VALUES
('Sample Project', 'A test project for development', 1),
('Marketing Campaign', 'Q4 marketing initiatives', 2);

-- Project Members
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'admin'),
(1, 2, 'member'),
(2, 2, 'admin'),
(2, 3, 'member');
```

## Health Check

Always start by checking if the API is running:
```http
GET /health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SynergySphere API is running",
  "timestamp": "2025-09-06T10:30:00.000Z",
  "version": "1.0.0"
}
```
