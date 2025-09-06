# SynergySphere Backend - Updated Database Schema

## Overview

This document describes the updated database schema for SynergySphere, which now uses a more flexible and normalized structure to handle users, projects, tasks, invitations, and tagging system.

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE Users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password      VARCHAR(255) NOT NULL,           -- hashed password
    profile_image VARCHAR(255),                    -- optional avatar/photo
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Projects Table
```sql
CREATE TABLE Projects (
    project_id     INT AUTO_INCREMENT PRIMARY KEY,
    owner_id       INT NOT NULL,                                -- who created the project
    manager_id     INT NOT NULL,                                -- assigned manager
    name           VARCHAR(200) NOT NULL,
    start_time     DATETIME NOT NULL,
    deadline       DATETIME NOT NULL,
    priority       ENUM('low','medium','high') DEFAULT 'low',
    status         ENUM('waiting','progress','completed') DEFAULT 'waiting',
    description    TEXT,
    profile_image  VARCHAR(255),                                -- optional: main image/cover
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id),
    FOREIGN KEY (manager_id) REFERENCES Users(user_id)
);
```

#### Tasks Table
```sql
CREATE TABLE Tasks (
    task_id        INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(200) NOT NULL,                   -- task name
    start_time     DATETIME NOT NULL,
    deadline       DATETIME NOT NULL,
    status         ENUM('progress','completed') DEFAULT 'progress',
    description    TEXT,
    profile_image  VARCHAR(255),                            -- optional image
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Relationship Tables

#### ProjectTaskUser (Linking Table)
```sql
CREATE TABLE ProjectTaskUser (
    project_id     INT NOT NULL,
    task_id        INT NOT NULL,
    user_id        INT NOT NULL,
    role           ENUM('owner','manager','member') DEFAULT 'member',
    PRIMARY KEY (project_id, task_id, user_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

#### Invitations Table
```sql
CREATE TABLE Invitations (
    invitation_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id_from   INT NOT NULL,                            -- sender
    user_id_to     INT NOT NULL,                            -- receiver
    project_id     INT NOT NULL,                            -- project for which invitation is sent
    status         ENUM('pending','accepted','declined') DEFAULT 'pending',
    sent_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at   TIMESTAMP NULL,
    FOREIGN KEY (user_id_from) REFERENCES Users(user_id),
    FOREIGN KEY (user_id_to) REFERENCES Users(user_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id)
);
```

### Tagging System

#### Tags Table
```sql
CREATE TABLE Tags (
    tag_id      INT AUTO_INCREMENT PRIMARY KEY,
    tag_name    VARCHAR(100) UNIQUE NOT NULL,
    tag_type    ENUM('project','task') NOT NULL
);
```

#### ProjectTagLinks Table
```sql
CREATE TABLE ProjectTagLinks (
    project_id   INT NOT NULL,
    tag_id       INT NOT NULL,
    PRIMARY KEY (project_id, tag_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id)
);
```

#### TaskTagLinks Table
```sql
CREATE TABLE TaskTagLinks (
    task_id      INT NOT NULL,
    tag_id       INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id)
);
```

## Key Changes from Previous Schema

### 1. Field Name Changes
- `id` → `user_id`, `project_id`, `task_id` for better clarity
- `password_hash` → `password` (still stores hashed passwords)
- `avatar_url` → `profile_image`
- `title` → `name` for tasks
- `due_date` → `deadline`

### 2. Removed Fields
- `role` field from Users (role-based access now handled through ProjectTaskUser)
- `status` field from Users (can be added back if needed)
- `bio` field from Users (can be added back if needed)
- `last_login` field from Users (can be tracked separately if needed)
- `is_private` field from Projects
- `created_by` field from Projects (now `owner_id`)
- `assignee_id` from Tasks (now handled through ProjectTaskUser relationship)
- `priority` from Tasks (moved to Projects level)

### 3. New Features
- **Invitation System**: Users can invite others to join projects
- **Tagging System**: Projects and tasks can be tagged for better organization
- **Flexible Role System**: Users can have different roles per project/task combination
- **Manager Assignment**: Projects can have dedicated managers besides owners

### 4. Relationship Changes
- Projects, Tasks, and Users are now connected through the `ProjectTaskUser` linking table
- This allows for more flexible relationships where users can have different roles for different tasks within the same project

## Model Updates

### User Model (`User.js`)
- Updated to work with new field names (`user_id`, `profile_image`)
- Removed role-based functionality (now handled through relationships)
- Updated queries to use new table structure

### Project Model (`Project.js`)
- Updated to work with new schema
- Queries now use `ProjectTaskUser` for member relationships

### Task Model (`Task.js`)
- Updated to work with new schema
- Task assignment now handled through `ProjectTaskUser` table

### New Models Added

#### Invitation Model (`Invitation.js`)
- Handle invitation creation, response, and management
- Track invitation status and timestamps

#### Tag Model (`Tag.js`)
- Manage project and task tags
- Handle tag assignment and removal
- Support tag searching and filtering

## Setup Instructions

1. **Database Setup**: Run the `database_setup.sql` file to create all tables with proper relationships and indexes

2. **Model Usage**: The updated models maintain the same interface where possible, but some methods have been updated to work with the new schema

3. **Migration**: If migrating from the old schema, you'll need to:
   - Export existing data
   - Create new tables
   - Transform and import data to match new structure
   - Update any existing API endpoints that rely on changed field names

## Performance Optimizations

The new schema includes several indexes for better performance:
- Email index on Users table
- Status indexes on Projects and Tasks
- Composite indexes on linking tables
- Foreign key indexes for faster joins

## Future Considerations

This schema is designed to be extensible:
- Additional user profile fields can be easily added
- The tagging system can be expanded with tag categories
- The invitation system can support different invitation types
- Role system can be extended with more granular permissions
