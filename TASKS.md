# AI Estimation System - Master Task List

> [!IMPORTANT]
> All tasks must follow the [Coding Guidelines](file:///Users/henryyeung/ai-estimation/CODING_GUIDELINES.md). 
> Status Flow: `PENDING` -> `IN PROGRESS` (User authorized) -> `WAITING FOR REVIEW` -> `DONE`.

---

## Phase 1: Foundation & Setup
**Status**: DONE | **Total Hours**: 40 | **Branch**: `feature/phase-1-foundation`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Project Initialization | DONE | 8 | `main` | Run `npx create-next-app@latest`. Install `lucide-react`, `clsx`, `tailwind-merge`. Config `tsconfig.json` paths. Outcome: Clean Next.js 14 environment running on port 3000. |
| Database Schema | DONE | 12 | `main` | Install `prisma`, `@prisma/client`. Run `npx prisma init`. Define models: User, Project, Task in `schema.prisma`. Run `npx prisma migrate dev`. Outcome: Postgres DB connected with schema. |
| Base UI Components | DONE | 12 | `main` | Create reusable atomic components in `src/components/ui/` (Button, Card, Input) using `cva` for variants. Outcome: Consistent component library ready for import. |
| Project Configuration | DONE | 8 | `main` | Setup `src/lib/utils.ts` for `cn()`. Configure `next.config.js`. Create `src/lib/api-client.ts` wrapper. Outcome: Optimized build config and API utilities. |

---

## Phase 2: Authentication & Subscription
**Status**: DONE | **Total Hours**: 48 | **Branch**: `feature/phase-2-auth-subs`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Authentication System | DONE | 24 | `feature/phase-2-1-auth-system` | Install `next-auth` & adapter. Config `GoogleProvider`/`GitHubProvider` in `src/lib/auth.ts`. Add env vars. Outcome: Secure login/logout flow with session persistence. |
| Subscription Management | DONE | 24 | `feature/phase-2-2-subscription` | Install `stripe`. Init client in `src/lib/stripe.ts`. Create webhook at `api/webhooks/stripe`. Outcome: Working payment flow updating `user.isPro` status. |

#### [REFINEMENT] Phase 2 Details
- **Issue #3 (Auto-redirect)**: ✅ Redirect authenticated users from `/` and `/login` to `/dashboard`.

---

## Phase 3: Frontend Development
**Status**: IN PROGRESS | **Total Hours**: 72 | **Branch**: `feature/phase-3-frontend`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Landing Page Polish | DONE | 16 | `feature/github-projects` | Modify `app/page.tsx`. Create `Hero`, `Features`, `Pricing` components. Use `framer-motion` for scroll animations. Outcome: High-converting landing page. |
| Dashboard Core | DONE | 14 | `feature/github-projects` | Create `DashboardLayout` component with Sidebar slot. Use `grid` for Projects list. Add `NewProjectModal`. Outcome: Functional dashboard base. |
| Mockup Consolidation | WAITING FOR REVIEW | 12 | `feature/frontend-polish` | Standardize `tailwind.config.ts` colors/fonts. Refactor Sidebar to `src/components/dashboard/Sidebar.tsx`. Outcome: Unified design system. |
| Dashboard Refinement | DONE | 12 | `feature/dashboard-refinement` | Refactor Sidebar navigation array. Implement `RightSidebar` toggle with `useState`. Add Sync button calling `POST /api/projects/sync`. Outcome: Clean navigation. |
| Chat Experience | PENDING | 12 | `feature/chat-flow` | Install `ai` & `openai`. Create `ChatPanel` component. Use `useChat` hook to handle streaming. Implement auto-scrolling message list. Outcome: Real-time AI chat UI. |
| Results Functionality | PENDING | 10 | `feature/results-api` | Create `EstimationTable` component. Use `tanstack/react-table` for sorting/filtering. Add 'Export CSV' button using `csv-stringify`. Outcome: Data-rich results view. |
| GitHub Connection UI | PENDING | 8 | `feature/github-ui` | Create `FileTree` recursive component. Add status indicators (green/red dots) for Repo connection. Outcome: Visual confirmation of GitHub sync. |
| Sidebar Link Cleanup | DONE | 4 | `feature/sidebar-cleanup` | Remove unused routes from `Sidebar.tsx`. Ensure `Link` components use `usePathname` for active state. Outcome: Streamlined navigation. |
| Right Sidebar Toggle | DONE | 6 | `feature/sidebar-toggle` | Add `RightSidebarContext` provider. Create toggle button in header. Outcome: Collapsible context panel. |
| Seed AI Estimation Project| DONE | 4 | `feature/seed-project` | Create `scripts/seed-local.ts`. Use `fs` to read `TASKS.md`. Prisma `createMany` to seed. Outcome: DB populated with own tasks. |
| Project Uniqueness Fix | DONE | 6 | `fix/project-uniqueness` | Update `POST /api/projects`. Check `prisma.project.findFirst({ url })`. Return existing if found. Outcome: No duplicate projects. |
| Schema Alignment | DONE | 8 | `feature/schema-alignment` | Update `schema.prisma`: Add `objective` to Task. Run `prisma migrate`. Update API to include field. Outcome: DB matches functionality. |
| Task Detail View | DONE | 8 | `feature/task-detail-view` | Create `[taskId]/page.tsx`. Use `Tab.Group` (headless UI) or state for tabs. Fetch task data via `useSWR` or `useEffect`. Outcome: Detailed task view. |
| Project Detail View | DONE | 8 | `feature/project-detail-view` | Refactor project page. Add `Tabs` component. Reuse `TaskBreakdown` component. Outcome: Consistent project interface. |
| Task Status & Progress | DONE | 6 | `feature/task-progress` | Add logic: `completedSubtasks / totalSubtasks`. Render `ProgressBar` component. Add Status Badge variants. Outcome: Visual progress tracking. |
| Phase Progress Bars | DONE | 6 | `feature/phase-progress` | Calculate phase % in `TaskBreakdown`. Render bar in accordion header. Outcome: High-level progress view. |
| Branch Creation UI | DONE | 4 | `feature/branch-creation-ui` | Logic: `!task.branch && ShowButton`. Button calls `POST /api/github/branch`. Outcome: One-click branch creation. |
| Dashboard Task Management | DONE | 8 | `feature/dashboard-task-mgmt` | Add Edit/Save mode to `TaskDetail`. Input fields replace text. Patch `api/tasks/[id]`. Outcome: In-place task editing. |

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
| AI Integration Setup | PENDING | 16 | `feature/ai-integration` | Install `openai`. Add `OPENAI_API_KEY` to `.env`. Create `src/lib/ai.ts` with `OpenAI` client. Define system prompts in `src/lib/prompts.ts` using constants. Outcome: Verified connection to OpenAI API with test completion. |
| Estimation Engine | PENDING | 28 | `feature/estimation-logic` | Create `src/services/estimation.ts`. Function `parseRequirement(text)`. Use regex or OpenAI function calling to extract tasks. Outcome: Text input converts to strictly typed `Task[]` JSON. |
| Chat API | PENDING | 20 | `feature/chat-api` | Create `app/api/chat/route.ts` (POST). Use `OpenAIStream` from `ai` SDK. Implement streaming text response. Outcome: Real-time streaming interface. |
| Project Management API | PENDING | 12 | `feature/projects-api` | Create `app/api/projects/route.ts`. Implement GET (list), POST (create), PUT (update), DELETE. Validate inputs with `zod`. Outcome: Full CRUD endpoints for projects. |
| Usage Tracking | PENDING | 12 | `feature/usage-metering` | Add `tokenUsage` to User model in Prisma. Middleware to check `user.credits > 0`. Increment counter after request. Outcome: Hard limit on free tier usage. |

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
| GitHub API Integration | DONE | 16 | `feature/github-api` | Install `octokit`. Init in `src/lib/github.ts`. Create `getRepoDetails(url)` & `getRepoIssues(url)`. Outcome: Successful fetch of metadata from public/private repos. |
| Repository Creation | DONE | 14 | `feature/repo-ops` | Endpoint `POST /api/github/create`. Use `octokit.repos.createForAuthenticatedUser`. Auto-commit `.gitignore`. Outcome: Button click creates actual repo on GitHub. |
| README & Issues | PENDING | 14 | `feature/github-actions` | Use `octokit.repos.createOrUpdateFileContents` for README. `octokit.issues.create` for tasks. Outcome: User's GitHub repo populated with docs. |

#### [REFINEMENT] Phase 5 Details
- **Issue #2 (Data Sync)**: ✅ Expanded sync to fetch repository metadata (Issues & Documents).
- **Issue #2 (Data Sync)**: ✅ Link GitHub Issues to platform Tasks via labels/keywords.

---

## Phase 6: Testing & Deployment
**Status**: PENDING | **Total Hours**: 20 | **Branch**: `feature/phase-6-deployment`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Unit & API Testing | PENDING | 12 | `feature/testing` | Install `jest`, `ts-jest`, `supertest`. Config `jest.config.js`. Write test `tests/api/auth.test.ts`. Outcome: CI-ready test suite passing locally. |
| Deployment & Monitoring | PENDING | 8 | `feature/ops` | Connect Vercel. Set `DATABASE_URL`, `NEXTAUTH_SECRET`. Install `@sentry/nextjs`. Outcome: Live HTTPS URL with error tracking. |

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
