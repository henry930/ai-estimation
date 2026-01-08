# API Quick Reference Guide

Quick reference for the most commonly used API endpoints.

## 🔐 Authentication

All endpoints require session authentication unless marked as 🔓 Public.

**Get Session**:
```bash
GET /api/auth/session
```

---

## 📁 Projects

### List Projects
```bash
GET /api/projects
```

### Create Project
```bash
POST /api/projects
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```

### Get Project
```bash
GET /api/projects/{id}
```

### Update Project
```bash
PUT /api/projects/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "ACTIVE"
}
```

### Delete Project
```bash
DELETE /api/projects/{id}
```

---

## ✅ Tasks

### Get Project Tasks
```bash
GET /api/projects/{id}/tasks
```

### Get Specific Task
```bash
GET /api/tasks/{taskId}
```

### Create Subtasks
```bash
POST /api/admin/tasks/{id}/subtasks
Content-Type: application/json

{
  "subtasks": [
    { "title": "Subtask 1", "hours": 2, "order": 0 },
    { "title": "Subtask 2", "hours": 3, "order": 1 }
  ]
}
```

---

## 🤖 AI Chat

### Project-Level Chat
```bash
POST /api/projects/{id}/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Create a new phase called 'Testing'" }
  ]
}
```

**Available Commands**:
- "Create a new phase called 'X' with objective 'Y' and order Z"
- "Add 3 tasks to phase {phase-id}"
- "Update task {task-id} status to IN PROGRESS"
- "Generate architecture documentation"

### Task-Level Chat
```bash
POST /api/admin/tasks/chat
Content-Type: application/json

{
  "taskId": "task_id",
  "messages": [
    { "role": "user", "content": "Create 3 subtasks" }
  ]
}
```

**Available Commands**:
- "Create 3 subtasks for this task"
- "Update the status to IN PROGRESS"
- "Set estimated hours to 8"
- "Add documentation link: https://..."

---

## 🔗 GitHub Integration

### List Repositories
```bash
GET /api/github/repos
```

### Create Repository
```bash
POST /api/github/repos/create
Content-Type: application/json

{
  "name": "new-repo",
  "description": "Description",
  "private": true
}
```

### Get Repository Files
```bash
GET /api/github/repos/{owner}/{repo}/files?path=/src
```

### List Issues
```bash
GET /api/github/issues?owner={owner}&repo={repo}
```

### Create Issue
```bash
POST /api/github/issues/create
Content-Type: application/json

{
  "owner": "user",
  "repo": "repo-name",
  "title": "New Issue",
  "body": "Issue description"
}
```

### Sync Project with GitHub
```bash
POST /api/projects/{id}/sync
Content-Type: application/json

{
  "githubUrl": "https://github.com/user/repo"
}
```

---

## 📊 Estimates

### Create Estimation
```bash
POST /api/estimate/create
Content-Type: application/json

{
  "projectName": "New Project",
  "description": "Description",
  "requirements": "Requirements"
}
```

### Get Estimation
```bash
GET /api/estimate/{id}
```

---

## 💳 Subscriptions

### Get Subscription Status
```bash
GET /api/subscription/status
```

### Create Checkout Session
```bash
POST /api/stripe/checkout
Content-Type: application/json

{
  "priceId": "price_xxx",
  "plan": "pro"
}
```

### Cancel Subscription
```bash
POST /api/subscription/cancel
```

---

## 🏥 Health & Diagnostics

### Health Check
```bash
GET /api/health
```

### Database Health
```bash
GET /api/health/db
```

### System Diagnostics
```bash
GET /api/diag
```

### Check Version
```bash
GET /api/check-version
```

---

## 📤 File Upload

### Upload Master Mind Document
```bash
POST /api/projects/{id}/master-mind/upload
Content-Type: multipart/form-data

file: <markdown/text/json file>
```

---

## 🔧 cURL Examples

### Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "My Project",
    "description": "A new project"
  }'
```

### Chat with AI
```bash
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "messages": [
      {"role": "user", "content": "Create a new phase"}
    ]
  }'
```

### Get Tasks
```bash
curl http://localhost:3000/api/projects/PROJECT_ID/tasks \
  -b cookies.txt
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Session cookies are automatically handled by the browser
- For programmatic access, save session cookies after login
- Streaming responses use `text/plain` content type
- Tool execution happens automatically during AI chat

---

## 🚀 Quick Start

1. **Login** via `/api/auth/signin`
2. **Create Project** via `POST /api/projects`
3. **Chat with AI** via `POST /api/projects/{id}/chat`
4. **View Tasks** via `GET /api/projects/{id}/tasks`

---

For full documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
