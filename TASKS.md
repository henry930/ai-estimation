# AI Estimation System - Master Task List

> [!IMPORTANT]
> All tasks must follow the [Coding Guidelines](file:///Users/henryyeung/ai-estimation/CODING_GUIDELINES.md). 
> Status Flow: `PENDING` -> `IN PROGRESS` (User authorized) -> `WAITING FOR REVIEW` -> `DONE`.

---

## Phase 1: Foundation & Setup
**Status**: DONE | **Total Hours**: 40 | **Branch**: `feature/phase-1-foundation`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Project Initialization | DONE | 8 | `main` | Initialize Next.js 14 app, configure TypeScript, ESLint, Prettier, install dependencies (Tailwind, Lucide), and set up environment variables (.env). |
| Database Schema | DONE | 12 | `main` | Define Prisma schema for User, Project, Task, TaskGroup models. Configure PostgreSQL connection. Create and run initial migration. |
| Base UI Components | DONE | 12 | `main` | Create reusable UI components (Button, Card, Input, Modal, Sidebar) using Tailwind CSS. Establish 'dashboard' layout with navigation. |
| Project Configuration | DONE | 8 | `main` | Set up NextAuth.js structure, API route handlers architecture (GET/POST/PATCH/DELETE), and global error handling utilities. |

---

## Phase 2: Authentication & Subscription
**Status**: DONE | **Total Hours**: 48 | **Branch**: `feature/phase-2-auth-subs`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Authentication System | DONE | 24 | `feature/phase-2-1-auth-system` | Implement GitHub OAuth provider via NextAuth. Allow users to sign in/up. Protect dashboard routes. Persist user sessions in DB. |
| Subscription Management | DONE | 24 | `feature/phase-2-2-subscription` | Integrate Stripe Checkout. Create pricing tiers (Free, Pro). Handle webhooks for checkout_completed and subscription_updated events to update user status. |

#### [REFINEMENT] Phase 2 Details
- **Issue #3 (Auto-redirect)**: ✅ Redirect authenticated users from `/` and `/login` to `/dashboard`.

---

## Phase 3: Frontend Development
**Status**: IN PROGRESS | **Total Hours**: 72 | **Branch**: `feature/phase-3-frontend`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Landing Page Polish | DONE | 16 | `feature/github-projects` | Refine Landing Page with distinct sections: Hero (CTA), Features, Testimonials, Pricing. Ensure responsive design and smooth scrolling. |
| Dashboard Core | DONE | 14 | `feature/github-projects` | Build main Dashboard layout with Sidebar. Implement 'My Projects' grid view. Add 'New Project' modal with GitHub Repo selection/creation. |
| Mockup Consolidation | WAITING FOR REVIEW | 12 | `feature/frontend-polish` | Unify fonts, colors, and spacing across all pages. Ensure consistent Sidebar navigation. Polish UI for 'Chat' and 'Results' placeholders. |
| Dashboard Refinement | DONE | 12 | `feature/dashboard-refinement` | Clean up sidebar links. Add right sidebar toggle. Implement GitHub Project Sync button to refreshing repo data manually. |
| Chat Experience | PENDING | 12 | `feature/chat-flow` | Build 'Talk to Task' interface. Implement sliding panel for AI chat. Handle streaming text responses. Support multi-line user input. |
| Results Functionality | PENDING | 10 | `feature/results-api` | Create view to display AI estimation results (JSON). Map API data to UI tables. Implement 'Export to CSV/PDF' logic. |
| GitHub Connection UI | PENDING | 8 | `feature/github-ui` | Add visual indicators for GitHub sync status (Repo connected, Last synced time). Add generic file tree viewer/browser. |
| Sidebar Link Cleanup | DONE | 4 | `feature/sidebar-cleanup` | Remove non-functional links. Restructure navigation to prioritize Projects, Tasks, and Settings. |
| Right Sidebar Toggle | DONE | 6 | `feature/sidebar-toggle` | Add collapsible functional right sidebar for context/help/chat, controlled by header icon. |
| Seed AI Estimation Project| DONE | 4 | `feature/seed-project` | Create a script/API to parse current repo's TASKS.md and seed the DB with this project's own tasks for dogfooding. |
| Project Uniqueness Fix | DONE | 6 | `fix/project-uniqueness` | Add database constraints or logic to prevent duplicate Projects for the same GitHub Repository URL. |
| Schema Alignment | DONE | 8 | `feature/schema-alignment` | Update Prisma schema to match Phase/Task hierarchy. Add 'Objective' field to Task model. Sync logic to populate these fields. |
| Task Detail View | DONE | 8 | `feature/task-detail-view` | Create `/projects/[id]/tasks/[taskId]` page. Implement tabs: Objective, Issues, Documents, Subtasks. |
| Project Detail View | DONE | 8 | `feature/project-detail-view` | Refactor Project page to match Task Detail layout. Tabs: Objective (Project Summary), Issues (Repo Issues), Docs, Tasks (Phase Tree). |
| Task Status & Progress | DONE | 6 | `feature/task-progress` | Add visual status badges (TODO/IN PROGRESS/DONE). Calculate and display progress bar % based on subtask completion. |
| Phase Progress Bars | DONE | 6 | `feature/phase-progress` | Implement aggregate progress bars on Phase headers, calculating % completion of all tasks within that phase. |
| Branch Creation UI | DONE | 4 | `feature/branch-creation-ui` | Add logic to check if Task has a linked branch. If not, show 'Create Branch' button. If yes, show link to GitHub branch. |
| Dashboard Task Management | DONE | 8 | `feature/dashboard-task-mgmt` | Enable 'Edit Mode' on Task Detail page. Allow updating Title, Objective, Status, and Description directly via UI (PATCH API). |

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
| AI Integration Setup | PENDING | 16 | `feature/ai-integration` | Configure OpenAI SDK/Google Gemini API. Set up system prompts for 'Estimation' and 'Chat' personas. Create shared AI utility functions. |
| Estimation Engine | PENDING | 28 | `feature/estimation-logic` | Develop core logic to analyze project documents (Readme, Issues) and generate a structured JSON task breakdown with hours and phases. |
| Chat API | PENDING | 20 | `feature/chat-api` | Create Next.js API route for chat. Implement Server-Sent Events (SSE) for streaming responses. Manage chat history/context in DB. |
| Project Management API | PENDING | 12 | `feature/projects-api` | Build robust CRUD endpoints for Projects and Tasks. Ensure proper validation and authorization loops for all mutation operations. |
| Usage Tracking | PENDING | 12 | `feature/usage-metering` | Implement logic to track token usage/costs per user. Enforce subscription limits (Free vs Pro) on AI requests. |

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
| GitHub API Integration | DONE | 16 | `feature/github-api` | Set up Octokit client. Create generic fetching functions for Repos, Issues, Pull Requests, and file contents (README/TASKS.md). |
| Repository Creation | DONE | 14 | `feature/repo-ops` | Implement flow to create new GitHub repositories via API on behalf of the user. Include template initialization (gitignore, readme). |
| README & Issues | PENDING | 14 | `feature/github-actions` | Develop logic to auto-generate markdown content (README/TASKS). Commit these files to the user's repo. Auto-create GitHub Issues from tasks. |

#### [REFINEMENT] Phase 5 Details
- **Issue #2 (Data Sync)**: ✅ Expanded sync to fetch repository metadata (Issues & Documents).
- **Issue #2 (Data Sync)**: ✅ Link GitHub Issues to platform Tasks via labels/keywords.

---

## Phase 6: Testing & Deployment
**Status**: PENDING | **Total Hours**: 20 | **Branch**: `feature/phase-6-deployment`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Unit & API Testing | PENDING | 12 | `feature/testing` | Set up Jest and Supertest. Write unit tests for core utilities and integration tests for critical API routes (Auth, Projects, Tasks). |
| Deployment & Monitoring | PENDING | 8 | `feature/ops` | configure Vercel deployment. Set up production PostgreSQL database. Implement logging (Sentry/LogRocket) and basic uptime monitoring. |

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
