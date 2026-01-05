# Nested Structure for Issues and Documents

## Overview

The AI Estimation System uses a hierarchical structure for **tasks**, **issues**, and **documents** that mirrors the Git branching strategy.

## Three-Level Hierarchy

### 1. Tasks (Already Implemented)
```
main
└── feature/phase-3-frontend
    └── feature/dashboard-v2
        └── feature/unified-interface
```

### 2. Issues (Nested)
Issues are organized by the task/sub-task they belong to:

```
/issues/
├── phase-1-foundation/
│   └── mockup-creation/
│       ├── mockup-landing.md
│       └── mockup-auth.md
├── phase-2-auth/
│   └── authentication-system/
│       ├── oauth-scope-escalation.md
│       └── session-refresh.md
└── phase-3-frontend/
    └── dashboard-core/
        ├── nested-task-hierarchy.md
        └── credit-deduction-race.md
```

### 3. Documents (Nested)
Documentation is organized by the task/sub-task they relate to:

```
/docs/
├── phase-1-foundation/
│   └── mockup-creation/
│       └── design-system.md
├── phase-2-auth/
│   ├── authentication-system/
│   │   └── oauth-flow.md
│   └── subscription-credit/
│       └── stripe-integration-guide.md
└── phase-3-frontend/
    ├── dashboard-core/
    │   ├── unified-interface-spec.md
    │   └── nested-task-data-model.md
    └── chat-experience/
        └── sse-streaming-guide.md
```

## Relationship Structure

Each level inherits and references its parent:

```
Task: feature/dashboard-v2
├── Issues: /issues/phase-3-frontend/dashboard-core/
├── Documents: /docs/phase-3-frontend/dashboard-core/
└── Sub-Tasks:
    ├── feature/unified-interface
    │   ├── Issues: /issues/phase-3-frontend/dashboard-core/unified-interface/
    │   └── Documents: /docs/phase-3-frontend/dashboard-core/unified-interface/
    └── feature/nested-task-list
        ├── Issues: /issues/phase-3-frontend/dashboard-core/nested-task-list/
        └── Documents: /docs/phase-3-frontend/dashboard-core/nested-task-list/
```

## Benefits

✅ **Clear Ownership** - Issues/docs belong to specific tasks  
✅ **Easy Navigation** - Follow task hierarchy to find related content  
✅ **Scoped Context** - Sub-task issues don't clutter parent task  
✅ **Merge Alignment** - When task merges, its issues/docs are resolved  
✅ **Scalability** - Add issues/docs at any level without confusion  

## Usage in task.md Files

Each task.md file references its nested issues and documents:

```markdown
## Issues
- [OAuth Scope Escalation](file:///path/to/issues/phase-2-auth/authentication-system/oauth-scope-escalation.md)
- [Session Refresh Logic](file:///path/to/issues/phase-2-auth/authentication-system/session-refresh.md)

## Documents
- [OAuth Flow Diagram](file:///path/to/docs/phase-2-auth/authentication-system/oauth-flow.md)
- [Authentication Architecture](file:///path/to/docs/phase-2-auth/authentication-system/architecture.md)
```

## Lifecycle

1. **Create**: When starting a task, create its issues/ and docs/ directories
2. **Populate**: Add issues and documents as they arise during development
3. **Reference**: Link from task.md to specific issue/doc files
4. **Resolve**: Mark issues as resolved when sub-task is complete
5. **Archive**: When task merges to parent, archive or move resolved issues

## Example: Dashboard Core

```
/issues/phase-3-frontend/dashboard-core/
├── nested-task-hierarchy.md (parent task issue)
├── credit-deduction-race.md (parent task issue)
├── unified-interface/
│   └── layout-responsiveness.md (sub-task issue)
└── nested-task-list/
    └── deep-nesting-performance.md (sub-task issue)

/docs/phase-3-frontend/dashboard-core/
├── unified-interface-spec.md (parent task doc)
├── data-model.md (parent task doc)
├── unified-interface/
│   └── component-api.md (sub-task doc)
└── nested-task-list/
    └── rendering-optimization.md (sub-task doc)
```

This creates a complete hierarchical structure where tasks, issues, documents, and branches all mirror each other.
