# AI Estimation System - Master Task List

> [!IMPORTANT]
> All tasks must follow the [Coding Guidelines](file:///Users/henryyeung/ai-estimation/CODING_GUIDELINES.md). 
> Status Flow: `PENDING` -> `IN PROGRESS` (User authorized) -> `WAITING FOR REVIEW` -> `DONE`.

---

## Phase 1: Foundation & Setup
**Status**: DONE | **Total Hours**: 40 | **Branch**: `feature/phase-1-foundation`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Project Initialization | DONE | 8 | `main` | Run `npx create-next-app@latest`. Install `lucide-react`, `clsx`, `tailwind-merge`. |
| Database Schema | DONE | 12 | `main` | Install `prisma`, `@prisma/client`. Run `npx prisma init`. |
| Base UI Components | DONE | 12 | `main` | Create reusable atomic components (Button, Card, Input). |
| Project Configuration | DONE | 8 | `main` | Setup optimized build config and API utilities. |

---

## Phase 2: Authentication & Subscription
**Status**: DONE | **Total Hours**: 48 | **Branch**: `feature/phase-2-auth-subs`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Authentication System | DONE | 24 | `feature/phase-2-1-auth-system` | Install `next-auth` & adapter. Config GitHubProvider. |
| Subscription Management | DONE | 24 | `feature/phase-2-2-subscription` | Install `stripe`. Create webhook and pricing UI. |

---

## Phase 3: Frontend Development
**Status**: DONE | **Total Hours**: 72 | **Branch**: `feature/phase-3-frontend`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Landing Page Polish | DONE | 16 | `feature/github-projects` | Hero, Features, Pricing sections with animations. |
| Dashboard Core | DONE | 14 | `feature/github-projects` | Projects grid, NewProjectModal, Sidebar structure. |
| Mockup Consolidation | DONE | 12 | `feature/frontend-polish` | Standardize design system and Sidebar components. |
| Chat Experience | DONE | 12 | `feature/chat-flow` | Real-time AI chat with streaming and auto-scroll. |
| Task Detail View | DONE | 10 | `feature/task-detail-view` | Tabbed interface (Description, Issues, Docs, ToDo). |
| Dashboard Management | DONE | 8 | `feature/dashboard-task-mgmt` | In-place editing and management dashboard view. |

---

## Phase 4: Backend API & AI Integration
**Status**: DONE | **Total Hours**: 88 | **Branch**: `feature/phase-4-ai-integration`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| AI Integration Setup | DONE | 16 | `feature/ai-integration` | Configure OpenAI SDK with streaming and local prompts. |
| Estimation Engine | DONE | 28 | `feature/estimation-logic` | Logic to transform requirements into structured tasks. |
| Chat API | DONE | 20 | `feature/chat-api` | Streaming chat endpoints with context management. |
| Usage Tracking | DONE | 24 | `feature/usage-metering` | Hard limits and usage counters for subscription tiers. |

---

## Phase 5: GitHub Integration
**Status**: DONE | **Total Hours**: 44 | **Branch**: `feature/phase-5-github-integration`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| GitHub API Integration | DONE | 16 | `feature/github-api` | Octokit setup for repo fetching and issue analysis. |
| Repository Creation | DONE | 14 | `feature/repo-ops` | Automated repository setup on GitHub via API. |
| README & Issues Sync | DONE | 14 | `feature/github-actions` | Auto-populate README and sync tasks to GitHub Issues. |

---

## Phase 6: Testing & Deployment
**Status**: DONE | **Total Hours**: 20 | **Branch**: `feature/phase-6-deployment`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Deployment Automation | DONE | 12 | `feature/ops` | Setup SST and Vercel for serverless deployment. |
| Production Verification | DONE | 8 | `feature/testing` | E2E testing of core flows in production environment. |

---

## Phase 7: Production Setup
**Status**: DONE | **Total Hours**: 8 | **Branch**: `phase-7-production-setup`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Database Migration | DONE | 4 | `phase-7-production-setup` | Connect RDS and run production schema migrations. |
| Environment Optimization | DONE | 4 | `phase-7-production-setup` | Setup secrets and optimize Next.js for production JS. |

---

## Phase 8: Advanced UI & Sync
**Status**: DONE | **Total Hours**: 16 | **Branch**: `feature/phase-8-advanced-ui-sync`

| Task Group | Status | Hours | Branch | Detail |
| :--- | :--- | :--- | :--- | :--- |
| Progress Visualization | DONE | 6 | `feature/phase-8-advanced-ui-sync` | Hour-weighted bars in Dashboard and Task Details. |
| AI Enquiry Tab | DONE | 6 | `feature/phase-8-advanced-ui-sync` | Task-specific AI chat with quick action buttons. |
| Real-time Issue Sync | DONE | 4 | `feature/phase-8-advanced-ui-sync` | Live sync of GitHub issue status into task details. |
| AI Project Agent | DONE | 8 | `feature/phase-8-advanced-ui-sync` | Strategic project-level AI assistant with permission-based updates. |

---

#### [REFINEMENT] AI Project Agent
**Description**: Strategic AI assistant that provides project-wide suggestions and structure updates.
**AI Enquiry Prompt**: "How to implement a permissions-based AI update flow for nested project task groups?"
**Issues**: 
- [x] Create project-level chat interface for AI Agents.
- [x] Inject full project context (groups/tasks/subtasks) into AI prompt.
- [x] UI handles permissions and suggestions flow.

#### [REFINEMENT] Progress Visualization
**Description**: Implemented weighted progress calculation logic that honors sub-task hours.
**AI Enquiry Prompt**: "How to implement a weighted average progress bar in React based on nested task hour estimates?"
**Issues**: 
- [x] Group progress reflects total task hours.
- [x] Task progress reflects sub-task hour weighting.
- [x] Visual bars added to headers and cards.

#### [REFINEMENT] AI Enquiry Tab
**Description**: Added a dedicated chat panel within the task view for direct AI assistance.
**AI Enquiry Prompt**: "Create a context-aware AI assistant prompt that only discusses the specific scope of Task ID: {id}."
**Issues**: 
- [x] Tabbed interface includes "Enquiry".
- [x] Quick buttons for "Update Estimation" and "Break down".
- [x] Context-aware AI responses.

#### [REFINEMENT] Real-time Issue Sync
**Description**: Live connection between GitHub Issue state and the platform's Task view.
**AI Enquiry Prompt**: "What's the best way to handle GitHub API rate limits when polling for issue status updates?"
**Issues**: 
- [x] Fetch single issue details from GitHub.
- [x] Display labels, state (Open/Closed), and body.
- [x] Handle unlinked state with Link Issue UI.

---

## Summary Progress Bar
**Overall Progress**: 100% (Complete)

| Phase | Progress |
| :--- | :--- |
| 1. Foundation | [xxxxxxxxxx] 100% |
| 2. Auth & Subs | [xxxxxxxxxx] 100% |
| 3. Frontend | [xxxxxxxxxx] 100% |
| 4. Backend/AI | [xxxxxxxxxx] 100% |
| 5. GitHub | [xxxxxxxxxx] 100% |
| 6. Testing/Ops | [xxxxxxxxxx] 100% |
| 7. Production Setup | [xxxxxxxxxx] 100% |
| 8. Advanced UI/Sync | [xxxxxxxxxx] 100% |
