# API Documentation

**Project**: AI Estimation Platform  
**Generated**: 2026-01-08  
**Version**: 1.0  
**Base URL**: `http://localhost:3000` (development) | `https://your-domain.com` (production)

## Overview

This document provides comprehensive documentation for all API endpoints in the AI Estimation platform. The platform provides project management, task estimation, GitHub integration, and AI-powered assistance.

## Authentication

Most endpoints require authentication via NextAuth.js session cookies. Protected endpoints will return `401 Unauthorized` if not authenticated.

**Authentication Methods**:
- Session-based (cookies) via NextAuth.js
- GitHub OAuth for user authentication

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-08T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-01-08T10:00:00.000Z"
}
```

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Projects](#project-endpoints)
3. [Tasks & Groups](#task-endpoints)
4. [AI Chat](#ai-chat-endpoints)
5. [GitHub Integration](#github-endpoints)
6. [Estimates](#estimate-endpoints)
7. [Subscriptions](#subscription-endpoints)
8. [Health & Diagnostics](#health-endpoints)

---

## Authentication Endpoints

### `GET/POST` `/api/auth/[...nextauth]`

**Description**: NextAuth.js authentication handler

**Methods**: `GET`, `POST`

**Authentication**: Public (handles authentication)

**Endpoints**:
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/callback/github` - GitHub OAuth callback
- `/api/auth/session` - Get current session

**Response** (session):
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "image": "avatar_url"
  },
  "expires": "2026-01-15T10:00:00.000Z"
}
```

---

## Project Endpoints

### `GET` `/api/projects`

**Description**: Get all projects for the authenticated user

**Authentication**: 🔒 Required

**Response**:
```json
[
  {
    "id": "project_id",
    "name": "Project Name",
    "description": "Project description",
    "objective": "Project objective",
    "status": "ACTIVE",
    "githubUrl": "https://github.com/user/repo",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-08T00:00:00.000Z"
  }
]
```

### `POST` `/api/projects`

**Description**: Create a new project

**Authentication**: 🔒 Required

**Request Body**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "objective": "Project objective",
  "githubUrl": "https://github.com/user/repo" // optional
}
```

**Response**:
```json
{
  "id": "new_project_id",
  "name": "New Project",
  "userId": "user_id",
  "status": "ACTIVE",
  "createdAt": "2026-01-08T10:00:00.000Z"
}
```

### `GET` `/api/projects/[id]`

**Description**: Get a specific project by ID

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Response**:
```json
{
  "id": "project_id",
  "name": "Project Name",
  "description": "Description",
  "objective": "Objective",
  "status": "ACTIVE",
  "tasks": [...],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### `PUT` `/api/projects/[id]`

**Description**: Update a project

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "objective": "Updated objective",
  "status": "ACTIVE" | "ARCHIVED"
}
```

### `DELETE` `/api/projects/[id]`

**Description**: Delete a project

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### `GET` `/api/projects/[id]/tasks`

**Description**: Get all tasks for a project (hierarchical structure)

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Response**:
```json
{
  "taskGroups": [
    {
      "id": "group_id",
      "title": "Phase 1",
      "objective": "Complete phase 1",
      "status": "IN PROGRESS",
      "hours": 40,
      "level": 0,
      "order": 0,
      "tasks": [
        {
          "id": "task_id",
          "title": "Task 1",
          "description": "Task description",
          "hours": 8,
          "status": "DONE",
          "level": 1,
          "subtasks": [...]
        }
      ]
    }
  ]
}
```

### `POST` `/api/projects/[id]/sync`

**Description**: Sync project with GitHub repository

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Request Body**:
```json
{
  "githubUrl": "https://github.com/user/repo"
}
```

**Response**:
```json
{
  "success": true,
  "synced": true,
  "tasksCreated": 15,
  "timestamp": "2026-01-08T10:00:00.000Z"
}
```

### `GET` `/api/projects/[id]/branches`

**Description**: Get all Git branches for a project

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Response**:
```json
{
  "branches": [
    {
      "name": "main",
      "sha": "abc123...",
      "protected": true
    },
    {
      "name": "feature/new-feature",
      "sha": "def456...",
      "protected": false
    }
  ]
}
```

### `POST` `/api/projects/[id]/master-mind/upload`

**Description**: Upload training documents to the AI Master Mind repository

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Request Body** (multipart/form-data):
```
file: File (markdown, text, json, yaml)
```

**Response**:
```json
{
  "success": true,
  "url": "s3://bucket/projects/project_id/master-mind/filename.md",
  "message": "File uploaded successfully"
}
```

### `GET` `/api/projects/[id]/root`

**Description**: Get the root task (level 0) for a project

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Response**:
```json
{
  "id": "root_task_id",
  "title": "Project Root",
  "level": 0,
  "projectId": "project_id"
}
```

---

## Task Endpoints

### `GET` `/api/tasks/[taskId]`

**Description**: Get a specific task by ID

**Authentication**: 🔒 Required

**Parameters**:
- `taskId` (path): Task ID

**Response**:
```json
{
  "id": "task_id",
  "projectId": "project_id",
  "parentId": "parent_id",
  "title": "Task Title",
  "description": "Task description",
  "objective": "Task objective",
  "hours": 8,
  "status": "IN PROGRESS",
  "level": 1,
  "order": 0,
  "branch": "feature/task-branch",
  "githubIssueNumber": 42,
  "documents": [...],
  "children": [...]
}
```

### `GET` `/api/admin/tasks`

**Description**: Get all tasks (admin view)

**Authentication**: 🔒 Required

**Response**:
```json
{
  "tasks": [...]
}
```

### `GET` `/api/admin/tasks/[id]`

**Description**: Get a specific task with full details

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Task ID

### `POST` `/api/admin/tasks/[id]/subtasks`

**Description**: Create subtasks for a task

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Parent task ID

**Request Body**:
```json
{
  "subtasks": [
    {
      "title": "Subtask 1",
      "hours": 2,
      "order": 0
    },
    {
      "title": "Subtask 2",
      "hours": 3,
      "order": 1
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "created": 2,
  "subtasks": [...]
}
```

### `POST` `/api/admin/tasks/refine`

**Description**: Use AI to refine task details

**Authentication**: 🔒 Required

**Request Body**:
```json
{
  "taskId": "task_id",
  "prompt": "Add more technical details to this task"
}
```

**Response**:
```json
{
  "success": true,
  "updatedTask": {...}
}
```

### `GET` `/api/groups/[id]`

**Description**: Get a task group (phase) by ID

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Group ID

---

## AI Chat Endpoints

### `POST` `/api/projects/[id]/chat`

**Description**: Chat with AI Project Agent (with tool calling)

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Project ID

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Create a new phase called 'Testing'"
    }
  ]
}
```

**Response**: Streaming text response

**Available Tools**:
- `update_project` - Update project details
- `create_phase` - Create new phase
- `add_tasks` - Add tasks to a phase
- `update_task` - Update task status/hours
- `generate_architecture` - Generate architecture docs
- `update_master_mind` - Update AI training instructions

### `POST` `/api/admin/tasks/chat`

**Description**: Chat with AI Task Assistant

**Authentication**: 🔒 Required

**Request Body**:
```json
{
  "taskId": "task_id",
  "messages": [
    {
      "role": "user",
      "content": "Create 3 subtasks for this"
    }
  ]
}
```

**Response**: Streaming text response

**Available Tools**:
- `update_plan` - Update task objective
- `add_documents` - Add documentation links
- `create_subtasks` - Create subtasks
- `update_hours` - Update hour estimate
- `update_status` - Update task status

### `POST` `/api/chat`

**Description**: General AI chat (legacy endpoint)

**Authentication**: 🔒 Required

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ]
}
```

---

## GitHub Endpoints

### `GET` `/api/github/repos`

**Description**: Get user's GitHub repositories

**Authentication**: 🔒 Required

**Response**:
```json
{
  "repositories": [
    {
      "id": 123456,
      "name": "repo-name",
      "full_name": "user/repo-name",
      "private": false,
      "html_url": "https://github.com/user/repo-name",
      "description": "Repo description"
    }
  ]
}
```

### `POST` `/api/github/repos/create`

**Description**: Create a new GitHub repository

**Authentication**: 🔒 Required

**Request Body**:
```json
{
  "name": "new-repo",
  "description": "Repository description",
  "private": true
}
```

**Response**:
```json
{
  "id": 789012,
  "name": "new-repo",
  "html_url": "https://github.com/user/new-repo"
}
```

### `GET` `/api/github/repos/[owner]/[repo]/files`

**Description**: Get files from a GitHub repository

**Authentication**: 🔒 Required

**Parameters**:
- `owner` (path): Repository owner
- `repo` (path): Repository name

**Query Parameters**:
- `path` (optional): Directory path

**Response**:
```json
{
  "files": [
    {
      "name": "README.md",
      "path": "README.md",
      "type": "file",
      "size": 1024
    }
  ]
}
```

### `GET` `/api/github/repos/readme`

**Description**: Get README content from a repository

**Authentication**: 🔒 Required

**Query Parameters**:
- `owner`: Repository owner
- `repo`: Repository name

**Response**:
```json
{
  "content": "# README content...",
  "encoding": "base64"
}
```

### `GET` `/api/github/issues`

**Description**: Get GitHub issues for a repository

**Authentication**: 🔒 Required

**Query Parameters**:
- `owner`: Repository owner
- `repo`: Repository name

**Response**:
```json
{
  "issues": [
    {
      "number": 1,
      "title": "Issue title",
      "state": "open",
      "body": "Issue description",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### `POST` `/api/github/issues/create`

**Description**: Create a new GitHub issue

**Authentication**: 🔒 Required

**Request Body**:
```json
{
  "owner": "user",
  "repo": "repo-name",
  "title": "New Issue",
  "body": "Issue description",
  "labels": ["bug", "enhancement"]
}
```

**Response**:
```json
{
  "number": 42,
  "title": "New Issue",
  "html_url": "https://github.com/user/repo/issues/42"
}
```

### `GET` `/api/github/issues/[issueNumber]`

**Description**: Get a specific GitHub issue

**Authentication**: 🔒 Required

**Parameters**:
- `issueNumber` (path): Issue number

**Query Parameters**:
- `owner`: Repository owner
- `repo`: Repository name

### `GET` `/api/github/branches/[branch]`

**Description**: Get information about a specific branch

**Authentication**: 🔒 Required

**Parameters**:
- `branch` (path): Branch name

**Query Parameters**:
- `owner`: Repository owner
- `repo`: Repository name

### `GET` `/api/github/docs`

**Description**: Get documentation files from repository

**Authentication**: 🔒 Required

**Query Parameters**:
- `owner`: Repository owner
- `repo`: Repository name
- `path`: Documentation path

---

## Estimate Endpoints

### `POST` `/api/estimate/create`

**Description**: Create a new project estimation

**Authentication**: 🔒 Required

**Request Body**:
```json
{
  "projectName": "New Project",
  "description": "Project description",
  "requirements": "Detailed requirements"
}
```

**Response**:
```json
{
  "id": "estimation_id",
  "projectName": "New Project",
  "totalHours": 120,
  "phases": [...]
}
```

### `GET` `/api/estimate/[id]`

**Description**: Get an estimation by ID

**Authentication**: 🔒 Required

**Parameters**:
- `id` (path): Estimation ID

---

## Subscription Endpoints

### `POST` `/api/stripe/checkout`

**Description**: Create Stripe checkout session

**Authentication**: 🔒 Required

**Request Body**:
```json
{
  "priceId": "price_xxx",
  "plan": "pro" | "team"
}
```

**Response**:
```json
{
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

### `POST` `/api/stripe/webhook`

**Description**: Stripe webhook handler

**Authentication**: Webhook signature verification

**Headers**:
- `stripe-signature`: Webhook signature

### `GET` `/api/subscription/status`

**Description**: Get current subscription status

**Authentication**: 🔒 Required

**Response**:
```json
{
  "status": "active" | "inactive" | "cancelled",
  "plan": "free" | "pro" | "team",
  "currentPeriodEnd": "2026-02-01T00:00:00.000Z"
}
```

### `POST` `/api/subscription/cancel`

**Description**: Cancel subscription

**Authentication**: 🔒 Required

**Response**:
```json
{
  "success": true,
  "message": "Subscription cancelled"
}
```

---

## Health Endpoints

### `GET` `/api/health`

**Description**: Basic health check

**Authentication**: Public

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T10:00:00.000Z"
}
```

### `GET` `/api/health/db`

**Description**: Database health check

**Authentication**: Public

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "latency": "5ms"
}
```

### `GET` `/api/diag`

**Description**: System diagnostics

**Authentication**: 🔒 Required (Admin)

**Response**:
```json
{
  "system": {
    "uptime": 3600,
    "memory": {...},
    "cpu": {...}
  },
  "database": {
    "status": "connected",
    "poolSize": 10
  },
  "services": {
    "s3": "ok",
    "github": "ok",
    "stripe": "ok"
  }
}
```

### `GET` `/api/check-version`

**Description**: Check API version

**Authentication**: Public

**Response**:
```json
{
  "version": "1.0.0",
  "build": "2026-01-08",
  "environment": "development"
}
```

---

## User Endpoints

### `GET` `/api/user/repos`

**Description**: Get user's connected repositories

**Authentication**: 🔒 Required

**Response**:
```json
{
  "repos": [
    {
      "id": "repo_id",
      "name": "repo-name",
      "url": "https://github.com/user/repo",
      "connected": true
    }
  ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. This may be added in future versions.

---

## Changelog

### Version 1.0 (2026-01-08)
- Initial API documentation
- 38 endpoints documented
- Direct Google SDK integration for AI chat
- GitHub OAuth authentication

---

## Support

For issues or questions, please contact the development team or create an issue in the GitHub repository.
