# Dashboard Core - Complete Task Breakdown

**Phase**: Phase 3 - Frontend Development  
**Status**: PENDING  
**Total Estimated Hours**: 156  
**Parent Branch**: `feature/phase-3-frontend`  
**Main Branch**: `feature/dashboard-core`

## Description

Central management hub for projects with deep nested task hierarchies. The dashboard enables:
1. GitHub account login/registration
2. Repository selection or creation when starting a project
3. Nested task/issue/document structure synced with GitHub
4. AI-powered project management with training, querying, and plan reconstruction

## Major Feature Areas

### 1. GitHub Authentication (24 hours)
**Branch**: `feature/github-auth-dashboard`

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| NextAuth.js Setup | PENDING | 4 | `feature/nextauth-config` | Configure GitHub provider |
| Login UI Component | PENDING | 3 | `feature/login-ui` | Modal with GitHub button |
| Registration Flow | PENDING | 3 | `feature/registration-flow` | Auto-create user on first login |
| Session Management | PENDING | 4 | `feature/session-mgmt` | JWT tokens, refresh logic |
| Protected Routes | PENDING | 3 | `feature/protected-routes` | Middleware for auth |
| User Profile Page | PENDING | 4 | `feature/user-profile` | Display GitHub info |
| Logout Functionality | PENDING | 1 | `feature/logout` | Clear session |
| OAuth Error Handling | PENDING | 2 | `feature/oauth-errors` | Handle auth failures |

**Issues**:
- [ ] OAuth token expiration handling
- [ ] Multiple account linking
- [ ] Session security best practices

**Documents**:
- Authentication flow diagram
- Security considerations
- GitHub OAuth setup guide

---

### 2. Repository Management (32 hours)
**Branch**: `feature/repo-management`

#### 2.1 Repository Selection (16 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| GitHub API Integration | PENDING | 5 | `feature/github-api` | Fetch user repositories |
| Repository List UI | PENDING | 4 | `feature/repo-list-ui` | Searchable, filterable list |
| Repository Picker Modal | PENDING | 3 | `feature/repo-picker` | Select existing repo |
| Permission Validation | PENDING | 2 | `feature/repo-permissions` | Check user access |
| Repository Sync Logic | PENDING | 2 | `feature/repo-sync` | Initial data sync |

**Issues**:
- [ ] Handle private vs public repos
- [ ] Repository access permissions
- [ ] Large repository list pagination

#### 2.2 Repository Creation (16 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Create Repo API | PENDING | 4 | `feature/create-repo-api` | GitHub API integration |
| Create Repo UI Form | PENDING | 3 | `feature/create-repo-ui` | Name, description, visibility |
| Template Selection | PENDING | 3 | `feature/repo-templates` | Optional starter templates |
| Initial Commit Setup | PENDING | 3 | `feature/initial-commit` | README, .gitignore, etc. |
| Webhook Configuration | PENDING | 3 | `feature/repo-webhooks` | Auto-sync on changes |

**Issues**:
- [ ] Repository naming conflicts
- [ ] Template customization
- [ ] Webhook security

**Documents**:
- Repository creation workflow
- Template structure guide
- Webhook setup instructions

---

### 3. Nested Structure Display (52 hours)
**Branch**: `feature/nested-structure`

#### 3.1 Database Schema (12 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Task Model (Self-Referential) | PENDING | 3 | `feature/task-model` | Parent-child relationships |
| Issue Model (Nested) | PENDING | 3 | `feature/issue-model` | Linked to tasks |
| Document Model (Nested) | PENDING | 3 | `feature/document-model` | Linked to tasks |
| Migration Scripts | PENDING | 2 | `feature/schema-migration` | Prisma migrations |
| Seed Data | PENDING | 1 | `feature/seed-data` | Test data |

**Issues**:
- [ ] Circular reference prevention
- [ ] Cascade delete behavior
- [ ] Performance with deep nesting

#### 3.2 Task Display Components (20 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Recursive Tree Component | PENDING | 6 | `feature/task-tree` | Expandable/collapsible |
| Task Row Component | PENDING | 3 | `feature/task-row` | Individual task display |
| Status Badge Component | PENDING | 2 | `feature/status-badge` | Color-coded statuses |
| Progress Bar Component | PENDING | 2 | `feature/progress-bar` | Visual progress |
| Breadcrumb Navigation | PENDING | 3 | `feature/breadcrumbs` | Show task hierarchy |
| Drag & Drop Reordering | PENDING | 4 | `feature/drag-drop` | Reorder tasks |

**Issues**:
- [ ] Performance with 100+ tasks
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation)

#### 3.3 Issue Display (10 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Issue List Component | PENDING | 3 | `feature/issue-list` | Nested issue display |
| GitHub Issue Sync | PENDING | 4 | `feature/github-issue-sync` | Fetch from GitHub API |
| Issue Detail View | PENDING | 2 | `feature/issue-detail` | Modal or side panel |
| Issue Status Updates | PENDING | 1 | `feature/issue-status` | Mark as resolved |

**Issues**:
- [ ] GitHub API rate limits
- [ ] Bidirectional sync conflicts
- [ ] Issue comment threading

#### 3.4 Document Display (10 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Document List Component | PENDING | 3 | `feature/doc-list` | Nested folder structure |
| GitHub Wiki Integration | PENDING | 4 | `feature/wiki-integration` | Fetch wiki pages |
| Markdown Renderer | PENDING | 2 | `feature/markdown-render` | Display .md files |
| Document Search | PENDING | 1 | `feature/doc-search` | Search across docs |

**Issues**:
- [ ] Large document rendering
- [ ] Wiki page organization
- [ ] External link handling

**Documents**:
- Component architecture diagram
- Data flow documentation
- UI/UX design specs

---

### 4. Task Page with Tabs (28 hours)
**Branch**: `feature/task-page`

#### 4.1 Tab Interface (12 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Tab Container Component | PENDING | 3 | `feature/tab-container` | Reusable tab system |
| Sub-Tasks Tab | PENDING | 3 | `feature/subtasks-tab` | Nested task table |
| Issues Tab | PENDING | 2 | `feature/issues-tab` | Issue list view |
| Documents Tab | PENDING | 2 | `feature/documents-tab` | Document tree view |
| Tab State Management | PENDING | 2 | `feature/tab-state` | Remember active tab |

**Issues**:
- [ ] Tab lazy loading
- [ ] Deep linking to specific tabs
- [ ] Tab content caching

#### 4.2 Search Functionality (8 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Search Bar Component | PENDING | 2 | `feature/search-bar` | Universal search input |
| Task Search Logic | PENDING | 2 | `feature/task-search` | Filter nested tasks |
| Issue Search Logic | PENDING | 2 | `feature/issue-search` | Search issue titles/descriptions |
| Document Search Logic | PENDING | 2 | `feature/doc-search-logic` | Full-text search |

**Issues**:
- [ ] Search performance optimization
- [ ] Fuzzy matching
- [ ] Search result ranking

#### 4.3 Filter & Sort (8 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Status Filter | PENDING | 2 | `feature/status-filter` | Filter by task status |
| Assignee Filter | PENDING | 2 | `feature/assignee-filter` | Filter by assignee |
| Sort Options | PENDING | 2 | `feature/sort-options` | Name, date, status, hours |
| Filter Persistence | PENDING | 2 | `feature/filter-persist` | Save filter preferences |

**Documents**:
- Search algorithm documentation
- Filter UX guidelines

---

### 5. AI Integration (20 hours)
**Branch**: `feature/ai-integration`

#### 5.1 AI Prompt Interface (8 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| AI Prompt Input Component | PENDING | 3 | `feature/ai-prompt-input` | Multi-line input with submit |
| Prompt History | PENDING | 2 | `feature/prompt-history` | Show previous prompts |
| Prompt Templates | PENDING | 2 | `feature/prompt-templates` | Pre-defined prompts |
| Prompt Validation | PENDING | 1 | `feature/prompt-validation` | Input validation |

**Issues**:
- [ ] Prompt length limits
- [ ] Template customization
- [ ] Prompt versioning

#### 5.2 AI Model Training (6 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Context Collection | PENDING | 2 | `feature/ai-context` | Gather project data |
| Training API Endpoint | PENDING | 2 | `feature/ai-training-api` | Send data to AI |
| Training Status UI | PENDING | 2 | `feature/training-status` | Show training progress |

**Issues**:
- [ ] Data privacy concerns
- [ ] Training cost management
- [ ] Model versioning

#### 5.3 AI Query & Response (6 hours)

| Sub-Task | Status | Hours | Branch | Notes |
|----------|--------|-------|--------|-------|
| Query API Endpoint | PENDING | 2 | `feature/ai-query-api` | Send queries to AI |
| Response Streaming | PENDING | 2 | `feature/ai-streaming` | SSE for real-time responses |
| Response Display | PENDING | 2 | `feature/ai-response-ui` | Markdown rendering |

**Issues**:
- [ ] Response timeout handling
- [ ] Streaming error recovery
- [ ] Response caching

**Documents**:
- AI integration architecture
- Prompt engineering guide
- Model training workflow

---

## API Endpoints Required

### Authentication
- `POST /api/auth/signin` - GitHub OAuth
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Repository
- `GET /api/repos` - List user repositories
- `POST /api/repos` - Create new repository
- `GET /api/repos/[id]` - Get repository details
- `POST /api/repos/[id]/sync` - Sync repository data

### Tasks
- `GET /api/tasks` - List all tasks (with hierarchy)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task with children
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task (cascade)
- `POST /api/tasks/[id]/reorder` - Reorder tasks

### Issues
- `GET /api/tasks/[id]/issues` - Get task issues
- `POST /api/tasks/[id]/issues` - Create issue
- `GET /api/issues/[id]` - Get issue details
- `PATCH /api/issues/[id]` - Update issue

### Documents
- `GET /api/tasks/[id]/documents` - Get task documents
- `POST /api/tasks/[id]/documents` - Add document
- `GET /api/documents/[id]` - Get document content

### AI
- `POST /api/ai/train` - Train model on project data
- `POST /api/ai/query` - Query AI
- `POST /api/ai/reconstruct` - Reconstruct plan

## Progress Tracking

**Overall**: 0% (0/156 hours completed)

### By Feature Area
- GitHub Authentication: 0/24 hours (0%)
- Repository Management: 0/32 hours (0%)
- Nested Structure Display: 0/52 hours (0%)
- Task Page with Tabs: 0/28 hours (0%)
- AI Integration: 0/20 hours (0%)

## Dependencies

1. GitHub Authentication must be complete before Repository Management
2. Repository Management must be complete before Nested Structure Display
3. Nested Structure Display must be complete before Task Page with Tabs
4. All above must be complete before AI Integration

## Estimated Timeline

- Week 1-2: GitHub Authentication + Repository Management (56 hours)
- Week 3-4: Nested Structure Display (52 hours)
- Week 5: Task Page with Tabs (28 hours)
- Week 6: AI Integration (20 hours)

**Total**: ~6 weeks for 1 developer working full-time (40 hours/week)
