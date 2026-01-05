# Standard Development Procedures

## Overview

This document defines the standard development workflow for all projects using the AI Estimation platform. This methodology ensures consistency, traceability, and efficient collaboration across all development efforts.

---

## The 6-Step Development Lifecycle

### Step 1: Project Creation & Repository Connection

**Objective**: Initialize project with GitHub integration

**Actions**:
1. User creates a new project in the platform
2. Choose one of two options:
   - **Connect existing repository**: Link to an existing GitHub repo
   - **Create new repository**: Platform creates a new repo via GitHub API

**Platform Requirements**:
- GitHub OAuth integration with `repo` scope
- API endpoint: `/api/projects` (POST)
- API endpoint: `/api/github/repos/create` (POST)
- Database: Store project with `githubUrl`, `githubRepoId`, `userId`

**Database Schema**:
```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  githubUrl   String?
  githubRepoId String?
  userId      String
  status      String   @default("active")
  createdAt   DateTime @default(now())
  lastSync    DateTime?
  
  user        User     @relation(fields: [userId], references: [id])
  taskGroups  TaskGroup[]
  estimations Estimation[]
}
```

---

### Step 2: AI Analysis & Development Plan Generation

**Objective**: Analyze requirements and generate comprehensive development plan

**Actions**:
1. User provides project requirements (text, documents, or existing codebase)
2. AI analyzes requirements and generates:
   - **Development Plan**: Overall strategy and approach
   - **Time Estimation**: Hours/days for each task
   - **Task List**: Hierarchical breakdown of work
   - **Technology Stack**: Recommended tools and frameworks
   - **Risk Assessment**: Potential challenges and mitigation

**Platform Requirements**:
- AI integration (OpenAI API)
- API endpoint: `/api/estimate/create` (POST)
- Parse and structure AI response into database format
- Generate `TASKS.md` file in repository

**Output Format** (`TASKS.md`):
```markdown
# Project Tasks

## Phase 1: Foundation
| Task | Status | Hours | Branch | Details |
|------|--------|-------|--------|---------|
| Setup | TODO | 8 | feature/phase-1-setup | Initial configuration |
| Database | TODO | 12 | feature/phase-1-database | Schema design |

### Setup Refinement
**Description**: Initial project setup
**AI Enquiry Prompt**: "How should we structure the project?"
**Issues**:
- [ ] Choose framework version
- [ ] Configure linting rules
**Documents**:
- [Architecture](file:///docs/architecture.md)
```

**Database Schema**:
```prisma
model Estimation {
  id          String   @id @default(cuid())
  projectId   String
  tasks       Json     // Structured task hierarchy
  totalHours  Int
  summary     String
  createdAt   DateTime @default(now())
  
  project     Project  @relation(fields: [projectId], references: [id])
}

model TaskGroup {
  id          String   @id @default(cuid())
  projectId   String
  title       String
  order       Int
  
  project     Project  @relation(fields: [projectId], references: [id])
  tasks       Task[]
}

model Task {
  id          String   @id @default(cuid())
  groupId     String
  title       String
  status      String   @default("TODO")
  hours       Int
  branch      String?
  description String?
  aiPrompt    String?
  issues      String?  // Markdown list
  order       Int
  
  group       TaskGroup @relation(fields: [groupId], references: [id])
  subTasks    SubTask[]
  documents   TaskDocument[]
}
```

---

### Step 3: Continuous Requirement Updates

**Objective**: Keep development plan synchronized with changing requirements

**Trigger Events**:
- User updates `ISSUES.md` in repository
- User modifies `TASKS.md` manually
- User requests re-analysis via platform
- New requirements added through platform UI

**Actions**:
1. Detect changes (webhook, manual sync, or scheduled)
2. Re-run AI analysis on updated requirements
3. Generate updated development plan
4. Merge with existing task structure (preserve completed work)
5. Update database and `TASKS.md`

**Platform Requirements**:
- GitHub webhook integration for file changes
- API endpoint: `/api/projects/sync` (POST)
- API endpoint: `/api/projects/[id]/sync` (POST)
- Intelligent merge algorithm (don't overwrite completed tasks)
- Version history for task changes

**Sync Algorithm**:
```typescript
// Pseudo-code for sync logic
function syncTasks(existingTasks, newTasks) {
  for (const newTask of newTasks) {
    const existing = findTask(existingTasks, newTask.title);
    
    if (existing) {
      // Preserve status and completion
      newTask.status = existing.status;
      newTask.completedAt = existing.completedAt;
      
      // Update other fields
      newTask.hours = newTask.hours; // Use new estimation
      newTask.description = newTask.description; // Use new description
    }
  }
  
  return mergedTasks;
}
```

---

### Step 4: Task Development Workflow

**Objective**: Execute development work following hierarchical task structure

**For Each Task**:

#### 4.1 Task Initialization
```bash
# 1. Create task directories
mkdir -p issues/[phase]/[task-name]
mkdir -p docs/[phase]/[task-name]

# 2. Create task branch from parent
git checkout [parent-branch]  # e.g., feature/phase-1-foundation
git rebase main
git checkout -b feature/[task-name]

# 3. Update task status in database
# API: PATCH /api/admin/tasks/[id]
# Set status: "IN_PROGRESS"
```

#### 4.2 Sub-Task Development
```bash
# For each sub-task:
# 1. Create sub-task directories
mkdir -p issues/[phase]/[task]/[subtask]
mkdir -p docs/[phase]/[task]/[subtask]

# 2. Create sub-task branch
git checkout feature/[task-name]
git rebase main
git checkout -b feature/[subtask-name]

# 3. Development cycle:
# - Write code
# - Write tests
# - Document changes
# - Create/update issues as needed

# 4. Commit and merge to parent
git add -A
git commit -m "feat: implement [subtask]"
git rebase main
git checkout feature/[task-name]
git merge feature/[subtask-name] --no-ff

# 5. Update sub-task status
# API: PATCH /api/admin/tasks/[id]/subtasks/[subtaskId]
# Set isCompleted: true
```

#### 4.3 Task Completion
```bash
# When all sub-tasks are done:
# 1. Final testing and verification
# 2. Merge to parent branch
git checkout [parent-branch]
git rebase main
git merge feature/[task-name] --no-ff

# 3. Update task status
# API: PATCH /api/admin/tasks/[id]
# Set status: "DONE"
```

**Platform Requirements**:
- Task status tracking UI
- Branch visualization
- Progress indicators
- API endpoints for task CRUD operations

**Database Schema**:
```prisma
model SubTask {
  id          String   @id @default(cuid())
  taskId      String
  title       String
  isCompleted Boolean  @default(false)
  order       Int
  
  task        Task     @relation(fields: [taskId], references: [id])
}

model TaskDocument {
  id          String   @id @default(cuid())
  taskId      String
  title       String
  url         String
  type        String   // "markdown", "link", etc.
  
  task        Task     @relation(fields: [taskId], references: [id])
}
```

---

### Step 5: Hierarchical Branch Merging

**Objective**: Maintain clean Git history with proper merge flow

**Merge Hierarchy**:
```
Sub-task branches → Task branch → Phase branch → main
```

**Example Flow**:
```bash
# Sub-task complete
feature/unified-interface → feature/dashboard-core

# Task complete (all sub-tasks merged)
feature/dashboard-core → feature/phase-3-frontend

# Phase complete (all tasks merged)
feature/phase-3-frontend → main
```

**Rules**:
1. Always rebase from `main` before merging
2. Use `--no-ff` flag to preserve branch history
3. Delete feature branches after successful merge
4. Update task status in database after each merge

**Platform Requirements**:
- Branch status tracking
- Merge conflict detection
- Automated status updates on merge

---

### Step 6: Database Persistence & Platform Visibility

**Objective**: All project data is stored and accessible through the platform

**Data to Persist**:

#### Projects
- Basic info (name, description, GitHub URL)
- Creation date, last sync date
- Owner and collaborators
- Status (active, archived, completed)

#### Tasks
- Hierarchical structure (phases → tasks → sub-tasks)
- Status (TODO, IN_PROGRESS, DONE)
- Time estimates and actual time
- Branch associations
- Descriptions and AI prompts

#### Issues
- Linked to specific tasks/sub-tasks
- Status tracking
- Priority levels
- Resolution notes

#### Documents
- Linked to tasks/sub-tasks
- File URLs (GitHub links)
- Document types
- Version tracking

#### Git History
- Branch creation/merge events
- Commit associations with tasks
- Developer activity tracking

**Platform UI Requirements**:

1. **Project Dashboard**
   - Overview of all projects
   - Quick stats (tasks completed, hours spent)
   - Recent activity feed

2. **Task Management View**
   - Hierarchical task tree
   - Drag-and-drop reordering
   - Status filters
   - Branch indicators

3. **Task Detail Page**
   - Tabs: Description, Issues, Documents, Sub-tasks
   - AI chat for task refinement
   - Branch status and merge controls
   - Time tracking

4. **Timeline View**
   - Gantt chart of tasks
   - Dependency visualization
   - Progress tracking

**API Endpoints Required**:
```
GET    /api/projects                    # List all projects
POST   /api/projects                    # Create project
GET    /api/projects/[id]               # Get project details
PATCH  /api/projects/[id]               # Update project
DELETE /api/projects/[id]               # Delete project

GET    /api/projects/[id]/tasks         # Get all tasks
POST   /api/admin/tasks                 # Create task
GET    /api/admin/tasks/[id]            # Get task details
PATCH  /api/admin/tasks/[id]            # Update task
DELETE /api/admin/tasks/[id]            # Delete task

POST   /api/admin/tasks/[id]/subtasks   # Create sub-task
PATCH  /api/admin/tasks/[id]/subtasks/[subtaskId]  # Update sub-task

POST   /api/projects/sync               # Sync from GitHub
GET    /api/projects/[id]/branches      # Get branch status
```

---

## Complete Workflow Example

### Scenario: Building a Dashboard Feature

#### Step 1: Project Creation
```
User: Creates "AI Estimation Platform" project
Platform: Creates GitHub repo "ai-estimation"
Database: Stores project record with GitHub URL
```

#### Step 2: AI Analysis
```
User: Provides requirements: "Build a dashboard with task management"
AI: Generates development plan:
  - Phase 1: Foundation (24h)
    - Setup Next.js (8h)
    - Database schema (12h)
    - UI components (4h)
  - Phase 2: Dashboard (40h)
    - Task list view (16h)
    - Task detail page (12h)
    - GitHub integration (12h)
Platform: Creates TASKS.md, stores in database
```

#### Step 3: Requirements Update
```
User: Adds to ISSUES.md: "Need real-time updates"
Platform: Detects change via webhook
AI: Re-analyzes, adds new task: "WebSocket integration (8h)"
Database: Updates task list, preserves existing progress
```

#### Step 4: Development
```
Developer: Works on "Task list view"
  - Creates feature/task-list-view branch
  - Implements 3 sub-tasks:
    - Unified interface (4h)
    - Nested task display (6h)
    - Filtering (6h)
  - Each sub-task has own branch
  - Merges sub-tasks to task branch
  - Updates status in platform
```

#### Step 5: Merging
```
Developer: Completes all dashboard tasks
  - Merges feature/task-list-view → feature/phase-2-dashboard
  - Merges feature/task-detail → feature/phase-2-dashboard
  - Merges feature/github-integration → feature/phase-2-dashboard
  - Merges feature/phase-2-dashboard → main
Platform: Updates all task statuses to DONE
```

#### Step 6: Platform View
```
User: Views project in platform
  - Sees hierarchical task tree
  - All tasks marked complete
  - Total time: 64h actual vs 64h estimated
  - Branch history visualized
  - Documents and issues linked
```

---

## Benefits of This Workflow

✅ **Consistency**: Same process across all projects  
✅ **Traceability**: Every change tracked in Git and database  
✅ **Flexibility**: Adapts to changing requirements  
✅ **Visibility**: Real-time progress tracking  
✅ **Collaboration**: Clear task ownership and dependencies  
✅ **AI-Powered**: Intelligent planning and re-planning  
✅ **Scalability**: Works for projects of any size  

---

## Implementation Checklist

### Platform Features
- [ ] GitHub OAuth with repo scope
- [ ] Repository creation/connection
- [ ] AI estimation engine
- [ ] TASKS.md parser and generator
- [ ] Webhook integration for file changes
- [ ] Task CRUD APIs
- [ ] Branch tracking system
- [ ] Hierarchical task UI
- [ ] Real-time sync
- [ ] Time tracking
- [ ] Document management
- [ ] Issue tracking

### Database Schema
- [ ] Projects table
- [ ] TaskGroups table
- [ ] Tasks table
- [ ] SubTasks table
- [ ] TaskDocuments table
- [ ] Estimations table
- [ ] Branch tracking
- [ ] Activity logs

### Git Integration
- [ ] Automatic branch creation
- [ ] Merge detection
- [ ] Conflict resolution UI
- [ ] Commit linking to tasks

This standard procedure ensures every project follows best practices and maintains high quality throughout the development lifecycle.
