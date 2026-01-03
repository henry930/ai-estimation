# Dashboard Core

**Phase**: Phase 3 - Frontend Development  
**Status**: IN PROGRESS  
**Estimated Hours**: 32  
**Parent Branch**: `feature/phase-3-frontend`  
**Main Branch**: `feature/dashboard-v2`

## Description

Central management hub for projects with deep nested task hierarchies. Supports GitHub repository connection. **The Project page and individual Task pages use a unified interface template.** Both include: Project/Task Name, Description, Issues (GitHub synced), Documents, and To-Do (nested task list in table format). Includes dynamic branch creation upon activation and an assignee system supporting GitHub users and Higgs Boson (Platform AI). Assigning to Higgs Boson for automated implementation requires deducting user account credits.

## Sub-Tasks

| Task | Status | Hours | Branch | Assignee | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Unified Interface Template | PENDING | 6 | `feature/unified-interface` | - | Shared layout for projects and tasks |
| Nested Task List Component | PENDING | 8 | `feature/nested-task-list` | - | Table format with deep hierarchy support |
| GitHub Connection Flow | PENDING | 4 | `feature/github-connection` | - | OAuth and repo picker refinement |
| Issues Tab (GitHub Sync) | PENDING | 4 | `feature/issues-tab` | - | Fetch and display GitHub issues |
| Documents Tab | PENDING | 2 | `feature/documents-tab` | - | Link to GitHub files and external docs |
| Assignee System | PENDING | 3 | `feature/assignee-system` | - | GitHub users + Higgs Boson selector |
| Credit Deduction Logic | PENDING | 3 | `feature/credit-deduction` | - | Check and deduct credits on Higgs Boson assignment |
| Dynamic Branch Creation | PENDING | 2 | `feature/dynamic-branches` | - | Create branch on task activation |

## Issues

- [ ] GitHub Connection: OAuth flow and repo picker needs refinement
- [ ] Nested Tasks: Each task needs to mirror the project structure (Desc, Issues, Docs, To-Do)
- [ ] Assignee Logic: Integration with GitHub users and Higgs Boson (Platform AI)
- [ ] Credit System: Logic for deducting credits when Higgs Boson is assigned
- [ ] Branch Strategy: Dynamic branch creation on task activation

## Documents

- [Dashboard Design](https://github.com/henry930/ai-estimation/blob/main/docs/dashboard-core.md)
- [Credit & Higgs Boson System](https://github.com/henry930/ai-estimation/blob/main/docs/credit-system.md)
- [Task Data Model](https://github.com/henry930/ai-estimation/blob/main/docs/task-structure.md)

## AI Enquiry Prompts

- "Suggest a layout for a nested task list that supports deep hierarchies without becoming cluttered."
- "How should I implement a unified interface that works for both projects and individual tasks?"

## Progress

**Overall**: 0% (0/8 sub-tasks completed)

```
[----------] 0%
```
