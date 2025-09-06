# SynergySphere – Advanced Team Collaboration Platform

## Vision
SynergySphere is built on a simple idea: teams do their best work when their tools truly support how they think, communicate, and move forward together. This platform goes beyond traditional project management by becoming an intelligent backbone for teams — helping them stay organized, communicate better, manage resources more effectively, and make informed decisions without friction.

At its core, SynergySphere is about helping teams operate at their best — continuously improving, staying aligned, and working smarter every day.

## Mission
Design and build a desktop and mobile-ready platform that acts like a central nervous system for team collaboration. SynergySphere should not only streamline the basics like tasks and communication but also work proactively — catching potential issues early and helping teams stay ahead rather than constantly reacting. The system should feel supportive, insightful, and seamless — naturally fitting into the rhythm of a working team.

## Pain Points Addressed
SynergySphere is designed to directly address common and persistent pain points experienced by teams across various domains:

- **Scattered Information:** Important files, chats, and decisions live in too many places. It’s hard to keep track of what’s where.
- **Unclear Progress:** Without visibility into tasks, it’s tough to know how far along a project really is — or what’s holding it up.
- **Resource Overload or Confusion:** Assignments can get messy. Team members end up overworked, underutilized, or unsure of what they’re supposed to do.
- **Deadline Surprises:** We often notice we're behind when it’s already too late. SynergySphere should surface potential issues before they become real problems.
- **Communication Gaps:** Updates get missed. People get left out of the loop. Conversations are buried in email or lost in scattered chats.

By addressing these pain points directly, SynergySphere positions itself as a platform that doesn’t just organize — it orchestrates collaboration intelligently and proactively.

---

## MVP Scope & Features
Develop a foundational version of SynergySphere, focusing on core task management and team communication. The MVP is accessible via both mobile and desktop interfaces, allowing users to:

- Register/login
- Create and manage projects
- Add team members
- Assign tasks with due dates and statuses
- Communicate within each project (threaded discussions)
- Visualize task progress in a clear, intuitive way
- Send basic notifications for important events

The prototype is clean, responsive, and able to handle data efficiently.

---

## Wireframes & User Experience

### Mobile Application (MVP)
Designed for accessibility and quick interactions, prioritizing core functionalities for users on the go. The UI is intuitive and user-friendly, ensuring a smooth experience.

- **Login/Sign Up Screen:** Standard input fields for email and password, sign-up and forgot password options.
- **Project List/Dashboard:** List of all projects the user is a member of, with a prominent button to create new projects.
- **Project Detail View:** Hub for a specific project, providing access to task lists/boards.
- **Task List/Board:** Simple list or card view of tasks, showing title, assignee, and due date. Quick add button for new tasks.
- **Task Creation:** Form to create a new task (title, description, assignee, due date).
- **Task Detail View:** Shows all details of a selected task, with editable fields for status and assignment.
- **User Profile/Settings:** Displays user's name and email, logout option, and basic notification preferences.

Mobile MVP prioritizes "on-the-go" use cases: quickly checking assigned tasks, updating statuses, receiving notifications, and sending brief messages within a project context.

### Desktop Application (MVP)
The desktop version begins to embody "command center" aspects, providing broader overviews for project leads/managers and facilitating easier data entry for complex tasks or detailed descriptions. All UI is mobile-friendly and responsive.

---

## Tech Stack
- **Frontend:** React, Tailwind CSS, Vite (responsive for desktop & mobile)
- **Backend:** Node.js, Express, SQL (see `/Backend` for API & schema)

---

## Repository Structure
- `/Frontend` — React frontend (desktop & mobile)
- `/Backend` — Node.js/Express backend, API, and database schema

---

## Getting Started
See the `README.md` files in `/Frontend` and `/Backend` for setup instructions, API details, and database schema.
