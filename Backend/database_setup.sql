-- SynergySphere Database Schema
-- This file contains all the table creation statements for the SynergySphere project

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS TaskTagLinks;
DROP TABLE IF EXISTS ProjectTagLinks;
DROP TABLE IF EXISTS Tags;
DROP TABLE IF EXISTS Invitations;
DROP TABLE IF EXISTS ProjectTaskUser;
DROP TABLE IF EXISTS Tasks;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS Users;

-- Create Users table
CREATE TABLE Users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,           -- full name
    email         VARCHAR(150) UNIQUE NOT NULL,    -- unique email
    password      VARCHAR(255) NOT NULL,           -- hashed password
    profile_image VARCHAR(255),                    -- optional avatar/photo
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Projects table
CREATE TABLE Projects (
    project_id     INT AUTO_INCREMENT PRIMARY KEY,
    owner_id       INT NOT NULL,                                -- who created the project
    manager_id     INT NOT NULL,                                -- optional: assigned manager
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

-- Create Tasks table
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

-- Create linking table for Project-Task-User relationships
CREATE TABLE ProjectTaskUser (
    project_id     INT NOT NULL,
    task_id        INT NOT NULL,
    user_id        INT NOT NULL,
    role           ENUM('owner','manager','member') DEFAULT 'member',  -- optional role per task
    PRIMARY KEY (project_id, task_id, user_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Create Invitations table
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

-- Create Tags table
CREATE TABLE Tags (
    tag_id      INT AUTO_INCREMENT PRIMARY KEY,
    tag_name    VARCHAR(100) UNIQUE NOT NULL,
    tag_type    ENUM('project','task') NOT NULL
);

-- Create ProjectTagLinks table
CREATE TABLE ProjectTagLinks (
    project_id   INT NOT NULL,
    tag_id       INT NOT NULL,
    PRIMARY KEY (project_id, tag_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id)
);

-- Create TaskTagLinks table
CREATE TABLE TaskTagLinks (
    task_id      INT NOT NULL,
    tag_id       INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id)
);

-- Insert some default tags
INSERT INTO Tags (tag_name, tag_type) VALUES
('Frontend', 'project'),
('Backend', 'project'),
('Mobile', 'project'),
('Web Development', 'project'),
('API', 'project'),
('Database', 'project'),
('UI/UX', 'task'),
('Bug Fix', 'task'),
('Feature', 'task'),
('Testing', 'task'),
('Documentation', 'task'),
('Optimization', 'task');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_projects_owner ON Projects(owner_id);
CREATE INDEX idx_projects_manager ON Projects(manager_id);
CREATE INDEX idx_projects_status ON Projects(status);
CREATE INDEX idx_tasks_status ON Tasks(status);
CREATE INDEX idx_invitations_to ON Invitations(user_id_to);
CREATE INDEX idx_invitations_from ON Invitations(user_id_from);
CREATE INDEX idx_invitations_status ON Invitations(status);
CREATE INDEX idx_project_task_user_project ON ProjectTaskUser(project_id);
CREATE INDEX idx_project_task_user_task ON ProjectTaskUser(task_id);
CREATE INDEX idx_project_task_user_user ON ProjectTaskUser(user_id);
