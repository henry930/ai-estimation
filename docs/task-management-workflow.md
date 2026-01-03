# Hierarchical Task Management Workflow

This document explains how to use and maintain the hierarchical task management structure in the AI Estimation System project.

## Overview

The project uses a two-tier task management system integrated with a hierarchical Git branching strategy:

1. **Master Task List** ([TASKS.md](file:///Users/henryyeung/ai-estimation/TASKS.md)) - High-level overview of all phases and major task groups
2. **Detailed Task Files** (`/tasks/phase-X/*.task.md`) - Granular breakdowns of complex tasks with sub-tasks
3. **Hierarchical Branching** ([Git Strategy](file:///Users/henryyeung/ai-estimation/docs/git-branching-strategy.md)) - Parent-child branch relationships that mirror task structure

## Directory Structure

```
/tasks/
├── phase-1-foundation/
│   └── mockup-creation.task.md
├── phase-2-auth/
│   ├── authentication-system.task.md
│   └── subscription-credit.task.md
├── phase-3-frontend/
│   ├── dashboard-core.task.md
│   ├── chat-experience.task.md
│   └── mockup-consolidation.task.md
├── phase-4-backend/
│   ├── ai-knowledge-base.task.md
│   └── estimation-engine.task.md
├── phase-5-github/
├── phase-6-testing/
```

## When to Create a Task File

Create a dedicated `task.md` file when a task:

- Has **3 or more sub-tasks** that need individual tracking
- Requires **multiple branches** for different components
- Has **complex dependencies** or integration points
- Needs **detailed issue tracking** beyond simple checkboxes
- Benefits from **separate documentation** and AI prompts

## Task File Template

Each `task.md` file follows this structure:

```markdown
# [Task Name]

**Phase**: [Phase Number and Name]
**Status**: [PENDING | IN PROGRESS | WAITING FOR REVIEW | DONE]
**Estimated Hours**: [Number]
**Main Branch**: [branch-name]

## Description
[Detailed description of what this task accomplishes]

## Sub-Tasks

| Task | Status | Hours | Branch | Assignee | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Sub-task 1] | PENDING | 4 | `feature/sub-1` | - | - |
| [Sub-task 2] | IN PROGRESS | 6 | `feature/sub-2` | @user | - |

## Issues
- [ ] Issue 1
- [ ] Issue 2

## Documents
- [Document Name](link)

## AI Enquiry Prompts
- "Prompt text here"

## Progress
[Progress bar or percentage]
```

## Workflow

### 1. Starting a New Task

1. Check if the task exists in [TASKS.md](file:///Users/henryyeung/ai-estimation/TASKS.md)
2. If it has a 📋 link, click to view the detailed task file
3. Review sub-tasks and select one to work on
4. Update the sub-task status to `IN PROGRESS`
5. Create the branch specified in the task file
6. Begin implementation

### 2. Updating Task Progress

**For Sub-Tasks:**
1. Open the relevant `task.md` file in `/tasks/phase-X/`
2. Update the sub-task status in the table
3. Add notes or assignee information as needed
4. Update the progress bar at the bottom

**For Main Tasks:**
1. When all sub-tasks are complete, update the main task status in [TASKS.md](file:///Users/henryyeung/ai-estimation/TASKS.md)
2. Update the phase progress bar if needed

### 3. Adding New Sub-Tasks

If you discover additional work during implementation:

1. Open the relevant `task.md` file
2. Add a new row to the Sub-Tasks table
3. Estimate hours and assign a branch
4. Update the total estimated hours in the header
5. Adjust the progress calculation

### 4. Creating New Task Files

When adding a new complex task:

1. Create a new file: `/tasks/phase-X/[task-name].task.md`
2. Use the template structure above
3. Add an entry to [TASKS.md](file:///Users/henryyeung/ai-estimation/TASKS.md) with a 📋 link
4. Ensure the link path is correct: `tasks/phase-X/[task-name].task.md`

## Benefits

✅ **Granular Tracking** - Track individual sub-tasks without cluttering the main file  
✅ **Better Organization** - Phase-based directories mirror project structure  
✅ **Flexible Branching** - Each sub-task can have its own branch strategy  
✅ **Team Collaboration** - Assignees can focus on specific task files  
✅ **Progress Visibility** - Clear progress bars at both task and phase levels  
✅ **Documentation** - Keep related issues, docs, and prompts together  

## Example: Working on Dashboard Core

1. Open [dashboard-core.task.md](file:///Users/henryyeung/ai-estimation/tasks/phase-3-frontend/dashboard-core.task.md)
2. See 8 sub-tasks with individual hour estimates
3. Choose "Nested Task List Component" (8 hours)
4. Update status to `IN PROGRESS`, assign to yourself
5. Create branch `feature/nested-task-list`
6. Implement the component
7. Mark as `DONE` when complete
8. Update progress: 1/8 complete = 12.5%

## Maintenance

- **Weekly Review**: Check all `IN PROGRESS` tasks for stale work
- **Monthly Cleanup**: Archive completed task files or mark as historical
- **Sync with GitHub**: Ensure task branches exist and are up to date
- **Update Estimates**: Adjust hours based on actual time spent

## Questions?

Use the AI Enquiry Prompts in each task file to get guidance on implementation approaches!
