# Dashboard Core

## Overview

Central management hub for the AI Estimation System with hierarchical task management, GitHub integration, and AI-powered project planning.

## Features

### 1. GitHub Authentication
- GitHub OAuth login/registration
- Session management with NextAuth.js
- Protected routes

### 2. Repository Management
- Select existing GitHub repositories
- Create new repositories from dashboard
- Automatic webhook configuration

### 3. Nested Structure Display
- Self-referential task hierarchy
- GitHub issue synchronization
- GitHub wiki integration
- Recursive tree UI components

### 4. Task Page with Tabs
- Sub-tasks, Issues, Documents tabs
- Universal search functionality
- Filter and sort capabilities

### 5. AI Integration
- AI prompt interface
- Model training on project data
- Query and plan reconstruction

## Implementation Details

**Total Estimated Hours**: 156  
**Timeline**: 6 weeks  
**Branches**: 46 total

See [dashboard-core-detailed.task.md](file:///Users/henryyeung/ai-estimation/tasks/phase-3-frontend/dashboard-core-detailed.task.md) for complete breakdown.

## Branch Structure

```
feature/dashboard-core (main)
├── feature/github-auth-dashboard
├── feature/repo-management
├── feature/nested-structure
├── feature/task-page
└── feature/ai-integration
```

See [dashboard-core-branches.md](file:///Users/henryyeung/ai-estimation/tasks/phase-3-frontend/dashboard-core-branches.md) for complete hierarchy.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL or SQLite
- GitHub OAuth App credentials

### Environment Variables

```env
# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database
DATABASE_URL=your_database_url
```

### Development

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Directory Structure

```
/src/app/dashboard/
├── layout.tsx          # Dashboard layout
├── page.tsx            # Dashboard home
├── projects/           # Project pages
│   └── [id]/
│       ├── page.tsx    # Project detail
│       └── tasks/
│           └── [taskId]/
│               └── page.tsx  # Task detail
└── settings/           # User settings

/src/components/dashboard/
├── TaskTree.tsx        # Recursive task tree
├── TaskRow.tsx         # Individual task display
├── IssueList.tsx       # Issue display
├── DocumentList.tsx    # Document display
└── AIPrompt.tsx        # AI integration

/issues/phase-3-frontend/dashboard-core/
└── (nested issue files)

/docs/phase-3-frontend/dashboard-core/
└── (nested documentation files)
```

## API Routes

See implementation plan for complete list of 20 API endpoints.

## Contributing

Follow the hierarchical branching strategy:
1. Create branch from appropriate parent
2. Implement feature
3. Create PR to parent branch
4. Merge upward when complete

## Documentation

- [Complete Task Breakdown](file:///Users/henryyeung/ai-estimation/tasks/phase-3-frontend/dashboard-core-detailed.task.md)
- [Branch Structure](file:///Users/henryyeung/ai-estimation/tasks/phase-3-frontend/dashboard-core-branches.md)
- [Database Schema](file:///Users/henryyeung/ai-estimation/docs/database-schema-hierarchical.md)
- [UI Components](file:///Users/henryyeung/ai-estimation/docs/dashboard-ui-hierarchical.md)
