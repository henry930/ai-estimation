# Dashboard Core - Branch Structure

## Branch Hierarchy

```
feature/phase-3-frontend (parent)
└── feature/dashboard-core (main task branch - 156 hours total)
    │
    ├── 1. GitHub Authentication (24 hours)
    │   └── feature/github-auth-dashboard
    │       ├── feature/nextauth-config (4h)
    │       ├── feature/login-ui (3h)
    │       ├── feature/registration-flow (3h)
    │       ├── feature/session-mgmt (4h)
    │       ├── feature/protected-routes (3h)
    │       ├── feature/user-profile (4h)
    │       ├── feature/logout (1h)
    │       └── feature/oauth-errors (2h)
    │
    ├── 2. Repository Management (32 hours)
    │   └── feature/repo-management
    │       ├── 2.1 Repository Selection (16h)
    │       │   ├── feature/github-api (5h)
    │       │   ├── feature/repo-list-ui (4h)
    │       │   ├── feature/repo-picker (3h)
    │       │   ├── feature/repo-permissions (2h)
    │       │   └── feature/repo-sync (2h)
    │       │
    │       └── 2.2 Repository Creation (16h)
    │           ├── feature/create-repo-api (4h)
    │           ├── feature/create-repo-ui (3h)
    │           ├── feature/repo-templates (3h)
    │           ├── feature/initial-commit (3h)
    │           └── feature/repo-webhooks (3h)
    │
    ├── 3. Nested Structure Display (52 hours)
    │   └── feature/nested-structure
    │       ├── 3.1 Database Schema (12h)
    │       │   ├── feature/task-model (3h)
    │       │   ├── feature/issue-model (3h)
    │       │   ├── feature/document-model (3h)
    │       │   ├── feature/schema-migration (2h)
    │       │   └── feature/seed-data (1h)
    │       │
    │       ├── 3.2 Task Display Components (20h)
    │       │   ├── feature/task-tree (6h)
    │       │   ├── feature/task-row (3h)
    │       │   ├── feature/status-badge (2h)
    │       │   ├── feature/progress-bar (2h)
    │       │   ├── feature/breadcrumbs (3h)
    │       │   └── feature/drag-drop (4h)
    │       │
    │       ├── 3.3 Issue Display (10h)
    │       │   ├── feature/issue-list (3h)
    │       │   ├── feature/github-issue-sync (4h)
    │       │   ├── feature/issue-detail (2h)
    │       │   └── feature/issue-status (1h)
    │       │
    │       └── 3.4 Document Display (10h)
    │           ├── feature/doc-list (3h)
    │           ├── feature/wiki-integration (4h)
    │           ├── feature/markdown-render (2h)
    │           └── feature/doc-search (1h)
    │
    ├── 4. Task Page with Tabs (28 hours)
    │   └── feature/task-page
    │       ├── 4.1 Tab Interface (12h)
    │       │   ├── feature/tab-container (3h)
    │       │   ├── feature/subtasks-tab (3h)
    │       │   ├── feature/issues-tab (2h)
    │       │   ├── feature/documents-tab (2h)
    │       │   └── feature/tab-state (2h)
    │       │
    │       ├── 4.2 Search Functionality (8h)
    │       │   ├── feature/search-bar (2h)
    │       │   ├── feature/task-search (2h)
    │       │   ├── feature/issue-search (2h)
    │       │   └── feature/doc-search-logic (2h)
    │       │
    │       └── 4.3 Filter & Sort (8h)
    │           ├── feature/status-filter (2h)
    │           ├── feature/assignee-filter (2h)
    │           ├── feature/sort-options (2h)
    │           └── feature/filter-persist (2h)
    │
    └── 5. AI Integration (20 hours)
        └── feature/ai-integration
            ├── 5.1 AI Prompt Interface (8h)
            │   ├── feature/ai-prompt-input (3h)
            │   ├── feature/prompt-history (2h)
            │   ├── feature/prompt-templates (2h)
            │   └── feature/prompt-validation (1h)
            │
            ├── 5.2 AI Model Training (6h)
            │   ├── feature/ai-context (2h)
            │   ├── feature/ai-training-api (2h)
            │   └── feature/training-status (2h)
            │
            └── 5.3 AI Query & Response (6h)
                ├── feature/ai-query-api (2h)
                ├── feature/ai-streaming (2h)
                └── feature/ai-response-ui (2h)
```

## Merge Flow

### Level 1: Sub-task → Feature Area
```bash
# Example: Complete NextAuth Config
git checkout feature/github-auth-dashboard
git merge feature/nextauth-config
# Repeat for all 8 auth sub-tasks
```

### Level 2: Feature Area → Main Task
```bash
# When all GitHub Auth sub-tasks are complete
git checkout feature/dashboard-core
git merge feature/github-auth-dashboard

# Repeat for all 5 feature areas
```

### Level 3: Main Task → Phase
```bash
# When all 5 feature areas are complete
git checkout feature/phase-3-frontend
git merge feature/dashboard-core
```

## Branch Creation Commands

### Create Main Task Branch
```bash
git checkout feature/phase-3-frontend
git pull origin feature/phase-3-frontend
git checkout -b feature/dashboard-core
git push -u origin feature/dashboard-core
```

### Create Feature Area Branches
```bash
# GitHub Authentication
git checkout feature/dashboard-core
git checkout -b feature/github-auth-dashboard
git push -u origin feature/github-auth-dashboard

# Repository Management
git checkout feature/dashboard-core
git checkout -b feature/repo-management
git push -u origin feature/repo-management

# Nested Structure Display
git checkout feature/dashboard-core
git checkout -b feature/nested-structure
git push -u origin feature/nested-structure

# Task Page with Tabs
git checkout feature/dashboard-core
git checkout -b feature/task-page
git push -u origin feature/task-page

# AI Integration
git checkout feature/dashboard-core
git checkout -b feature/ai-integration
git push -u origin feature/ai-integration
```

### Create Sub-task Branches (Example)
```bash
# From GitHub Auth feature branch
git checkout feature/github-auth-dashboard
git checkout -b feature/nextauth-config
git push -u origin feature/nextauth-config
```

## Total Branch Count

- **1** Main task branch (`feature/dashboard-core`)
- **5** Feature area branches
- **40+** Sub-task branches
- **Total**: ~46 branches for complete Dashboard Core implementation

## Branch Naming Convention

- **Main Task**: `feature/dashboard-core`
- **Feature Area**: `feature/[feature-name]`
- **Sub-task**: `feature/[descriptive-name]`

All branches follow the hierarchical structure and merge upward.
