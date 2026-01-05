# AI Estimation System - Master Task List

> [!IMPORTANT]
> All tasks must follow the [Coding Guidelines](file:///Users/henryyeung/ai-estimation/CODING_GUIDELINES.md). 
> Status Flow: `PENDING` -> `IN PROGRESS` (User authorized) -> `WAITING FOR REVIEW` -> `DONE`.

---

## Phase 1: Foundation & Setup
**Status**: DONE | **Total Hours**: 40 | **Branch**: `feature/phase-1-foundation`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Project Initialization | DONE | 8 | `main` | Setup Next.js, packages, env |
| Database Schema | DONE | 12 | `main` | PostgreSQL/Prisma definition & migrations |
| Base UI Components | DONE | 12 | `main` | Design system & core primitives |
| Project Configuration | DONE | 8 | `main` | API structure & error handling |

---

## Phase 2: Authentication & Subscription
**Status**: DONE | **Total Hours**: 48 | **Branch**: `feature/phase-2-auth-subs`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Authentication System | DONE | 24 | `feature/phase-2-1-auth-system` | GitHub OAuth & Session Management |
| Subscription Management | DONE | 24 | `feature/phase-2-2-subscription` | Stripe Checkout & Webhook Handlers |

#### [REFINEMENT] Phase 2 Details
- **Issue #3 (Auto-redirect)**: ✅ Redirect authenticated users from `/` and `/login` to `/dashboard`.

---

## Phase 3: Frontend Development
**Status**: IN PROGRESS | **Total Hours**: 72 | **Branch**: `feature/phase-3-frontend`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Landing Page Polish | DONE | 16 | `feature/github-projects` | Hero, Features, Pricing, Testimonials |
| Dashboard Core | DONE | 14 | `feature/github-projects` | Layout, Project List, Repo Selector |
| Mockup Consolidation | WAITING FOR REVIEW | 12 | `feature/frontend-polish` | Polishing Sidebar, Chat, Results UI |
| Dashboard Refinement | DONE | 12 | `feature/dashboard-refinement` | Sidebar cleanup, toggle logic, project sync |
| Chat Experience | PENDING | 12 | `feature/chat-flow` | Streaming support, Input system |
| Results Functionality | PENDING | 10 | `feature/results-api` | Real data mapping, Export logic |
| GitHub Connection UI | PENDING | 8 | `feature/github-ui` | File tree viewer, Status indicators |
| Sidebar Link Cleanup | DONE | 4 | `feature/sidebar-cleanup` | Remove dead links and Manage Tasks |
| Right Sidebar Toggle | DONE | 6 | `feature/sidebar-toggle` | Show/hide right sidebar via icon |
| Seed AI Estimation Project| DONE | 4 | `feature/seed-project` | Sync current git repo to DB |
| Project Uniqueness Fix | DONE | 6 | `fix/project-uniqueness` | Prevent duplicate projects for same repo |
| Schema Alignment | DONE | 8 | `feature/schema-alignment` | Group tasks by Phase, Sync Objectives |
| Task Detail View | DONE | 8 | `feature/task-detail-view` | Individual pages with tabs for tasks |
| Project Detail View | DONE | 8 | `feature/project-detail-view` | Project page tabs: Obj, Issues, Docs, Tasks |
| Project Detail View | DONE | 8 | `feature/project-detail-view` | Project page tabs: Obj, Issues, Docs, Tasks |
| Task Status & Progress | DONE | 6 | `feature/task-progress` | Display status and subtask % completion |
| Task Status & Progress | DONE | 6 | `feature/task-progress` | Display status and subtask % completion |
| Phase Progress Bars | DONE | 6 | `feature/phase-progress` | Aggregated progress for Task Groups |
| Branch Creation UI | DONE | 4 | `feature/branch-creation-ui` | Button to create branch from Task Detail |

#### [REFINEMENT] Phase 3 Details
- **Issue #1 (Landing Page CTA)**: ✅ Route "Start Estimation" to `/login`.
- **Issue #4 (Dashboard Refinement)**:
  - [x] Remove "Manage Tasks" and dead links from left sidebar.
  - [x] Implement toggle icon for right sidebar.
  - [x] Ensure `ai-estimation` project is in "My Projects" list.
  - [x] Prevent duplicate projects for the same repository.

#### Chat Experience (Pending)
- **Description**: Implement SSE (Server Side Events) for streaming AI responses and a robust input state.
- **AI Enquiry Prompt**: "How to handle multi-line input in a Tailwind chat bubble while maintaining auto-scroll?"
- **Issues**: 
  - [ ] Need to decide on streaming library (Vercel AI SDK vs native fetch).

---

## Phase 4: Backend API & AI Integration
**Status**: PENDING | **Total Hours**: 88 | **Branch**: `feature/phase-4-ai-integration`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| AI Integration Setup | PENDING | 16 | `feature/ai-integration` | OpenAI/Prompt Engineering |
| Estimation Engine | PENDING | 28 | `feature/estimation-logic` | Requirement analysis & task generation |
| Chat API | PENDING | 20 | `feature/chat-api` | SSE Streaming Endpoint & Context |
| Project Management API | PENDING | 12 | `feature/projects-api` | Full CRUD for projects/estimations |
| Usage Tracking | PENDING | 12 | `feature/usage-metering` | Credits & Limit enforcement |

### [REFINEMENT] Phase 4 Details
#### Estimation Engine
- **Description**: The core logic that transforms text/files into structured JSON for tasks.
- **AI Enquiry Prompt**: "Give me a prompt template for extracting technical tasks from a PDF requirements document."
- **Issues**: 
  - [ ] Need to handle very long context windows.

---

## Phase 5: GitHub Integration
**Status**: IN PROGRESS | **Total Hours**: 44 | **Branch**: `feature/phase-5-github-integration`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| GitHub API Integration | DONE | 16 | `feature/github-api` | Repository, Issue & File fetching |
| Repository Creation | DONE | 14 | `feature/repo-ops` | Automated repo creation & config |
| README & Issues | PENDING | 14 | `feature/github-actions` | Auto-committing README & Task issues |

#### [REFINEMENT] Phase 5 Details
- **Issue #2 (Data Sync)**: ✅ Expanded sync to fetch repository metadata (Issues & Documents).
- **Issue #2 (Data Sync)**: ✅ Link GitHub Issues to platform Tasks via labels/keywords.

---

## Phase 6: Testing & Deployment
**Status**: PENDING | **Total Hours**: 20 | **Branch**: `feature/phase-6-deployment`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Unit & API Testing | PENDING | 12 | `feature/testing` | Jest/Supertest suite |
| Deployment & Monitoring | PENDING | 8 | `feature/ops` | Vercel, DB migration logic, Logging |

---

## Summary Progress Bar
**Overall Progress**: 60% (40/67 tasks approx)

| Phase | Progress |
| :--- | :--- |
| 1. Foundation | [xxxxxxxxxx] 100% |
| 2. Auth & Subs | [xxxxxxxxxx] 100% |
| 3. Frontend | [xxxxxxx---] 70% |
| 4. Backend/AI | [----------] 0% |
| 5. GitHub | [xxxxxxx---] 70% |
| 6. Testing/Ops | [----------] 0% |
