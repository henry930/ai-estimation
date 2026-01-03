# Complete Hierarchical Structure

## Overview

The AI Estimation System uses a **unified hierarchical structure** across four dimensions: **Tasks**, **Branches**, **Issues**, and **Documents**.

## The Four Dimensions

```
┌─────────────────────────────────────────────────────────────┐
│                    HIERARCHICAL STRUCTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 3: Frontend Development                              │
│  ├── Tasks:    /tasks/phase-3-frontend/                    │
│  ├── Branches: feature/phase-3-frontend                     │
│  ├── Issues:   /issues/phase-3-frontend/                   │
│  └── Docs:     /docs/phase-3-frontend/                     │
│      │                                                       │
│      └── Dashboard Core                                     │
│          ├── Tasks:    dashboard-core.task.md               │
│          ├── Branches: feature/dashboard-v2                 │
│          ├── Issues:   /issues/.../dashboard-core/          │
│          └── Docs:     /docs/.../dashboard-core/            │
│              │                                               │
│              └── Unified Interface (Sub-task)               │
│                  ├── Tasks:    (row in parent task.md)      │
│                  ├── Branches: feature/unified-interface    │
│                  ├── Issues:   .../unified-interface/       │
│                  └── Docs:     .../unified-interface/       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
ai-estimation/
├── TASKS.md                          # Master task list
├── tasks/                            # Detailed task breakdowns
│   └── phase-3-frontend/
│       └── dashboard-core.task.md
├── issues/                           # Nested issues
│   └── phase-3-frontend/
│       └── dashboard-core/
│           ├── credit-system.md      # Task-level issue
│           └── unified-interface/
│               └── layout.md         # Sub-task issue
├── docs/                             # Nested documentation
│   └── phase-3-frontend/
│       └── dashboard-core/
│           ├── architecture.md       # Task-level doc
│           └── unified-interface/
│               └── api-spec.md       # Sub-task doc
└── .git/
    └── refs/heads/
        └── feature/
            └── phase-3-frontend/
                └── dashboard-v2/
                    └── unified-interface  # Branch
```

## Relationship Matrix

| Level | Task File | Git Branch | Issues Directory | Docs Directory |
|-------|-----------|------------|------------------|----------------|
| **Phase** | TASKS.md | `feature/phase-3-frontend` | `/issues/phase-3-frontend/` | `/docs/phase-3-frontend/` |
| **Task** | `dashboard-core.task.md` | `feature/dashboard-v2` | `.../dashboard-core/` | `.../dashboard-core/` |
| **Sub-task** | Row in parent task.md | `feature/unified-interface` | `.../unified-interface/` | `.../unified-interface/` |

## Lifecycle Flow

### 1. Starting a Task

```bash
# 1. Create directories
mkdir -p issues/phase-3-frontend/dashboard-core
mkdir -p docs/phase-3-frontend/dashboard-core

# 2. Create branch from parent
git checkout feature/phase-3-frontend
git checkout -b feature/dashboard-v2

# 3. Update task.md status to IN PROGRESS
```

### 2. Working on a Sub-task

```bash
# 1. Create sub-task directories
mkdir -p issues/phase-3-frontend/dashboard-core/unified-interface
mkdir -p docs/phase-3-frontend/dashboard-core/unified-interface

# 2. Create sub-task branch
git checkout feature/dashboard-v2
git checkout -b feature/unified-interface

# 3. Create issues/docs as needed
# 4. Reference them in task.md
```

### 3. Completing a Sub-task

```bash
# 1. Resolve all issues in .../unified-interface/
# 2. Finalize docs in .../unified-interface/
# 3. Merge branch
git checkout feature/dashboard-v2
git merge feature/unified-interface
# 4. Update task.md: mark sub-task as DONE
```

### 4. Completing a Task

```bash
# All sub-tasks merged
# All issues resolved
# All docs complete
git checkout feature/phase-3-frontend
git merge feature/dashboard-v2
# Update TASKS.md: mark task as DONE
```

## Example: Dashboard Core

### Task Structure
```
tasks/phase-3-frontend/dashboard-core.task.md
```

### Branch Hierarchy
```
feature/phase-3-frontend (parent)
└── feature/dashboard-v2 (main task branch)
    ├── feature/unified-interface
    ├── feature/nested-task-list
    ├── feature/github-connection
    └── ... (8 sub-task branches)
```

### Issues Hierarchy
```
issues/phase-3-frontend/dashboard-core/
├── nested-task-hierarchy.md        # Task-level
├── credit-deduction-race.md        # Task-level
├── unified-interface/
│   └── layout-responsiveness.md    # Sub-task level
├── nested-task-list/
│   └── performance.md              # Sub-task level
└── github-connection/
    └── oauth-scope.md              # Sub-task level
```

### Docs Hierarchy
```
docs/phase-3-frontend/dashboard-core/
├── architecture.md                 # Task-level
├── data-model.md                   # Task-level
├── unified-interface/
│   ├── component-api.md           # Sub-task level
│   └── design-spec.md             # Sub-task level
├── nested-task-list/
│   └── rendering-guide.md         # Sub-task level
└── github-connection/
    └── integration-flow.md        # Sub-task level
```

## Benefits of Unified Hierarchy

✅ **Consistency** - Same structure across all dimensions  
✅ **Discoverability** - Easy to find related issues/docs for any task  
✅ **Scoped Context** - Sub-task issues don't clutter parent  
✅ **Merge Alignment** - When branch merges, its issues are resolved  
✅ **Clear Ownership** - Each issue/doc belongs to specific task  
✅ **Scalability** - Add new levels without confusion  

## Quick Reference

### Find Issues for a Task
```
/issues/[phase]/[task-name]/
```

### Find Docs for a Sub-task
```
/docs/[phase]/[task-name]/[sub-task-name]/
```

### Reference in task.md
```markdown
## Issues
- [Issue Name](file:///path/to/issues/phase-X/task/issue.md)

## Documents  
- [Doc Name](file:///path/to/docs/phase-X/task/doc.md)
```

## Integration with Existing Files

Update each `task.md` file to reference its nested issues and docs:

```markdown
# Dashboard Core

**Parent Branch**: `feature/phase-3-frontend`
**Main Branch**: `feature/dashboard-v2`

## Issues
- [Nested Task Hierarchy](file:///Users/henryyeung/ai-estimation/issues/phase-3-frontend/dashboard-core/nested-task-hierarchy.md)
- [Credit Deduction Race Condition](file:///Users/henryyeung/ai-estimation/issues/phase-3-frontend/dashboard-core/credit-deduction-race.md)

## Documents
- [Dashboard Architecture](file:///Users/henryyeung/ai-estimation/docs/phase-3-frontend/dashboard-core/architecture.md)
- [Data Model Specification](file:///Users/henryyeung/ai-estimation/docs/phase-3-frontend/dashboard-core/data-model.md)

## Sub-Tasks

| Task | Issues | Documents |
|------|--------|-----------|
| Unified Interface | [Layout Issue](file:///.../unified-interface/layout.md) | [API Spec](file:///.../unified-interface/api-spec.md) |
```

This creates a **complete, unified hierarchical system** where everything mirrors the task structure.
