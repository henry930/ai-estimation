# Git Branching Strategy

## Overview

The AI Estimation System uses a **hierarchical branching strategy** where tasks create branches from their parent branch, and merges flow upward through the hierarchy once all child branches are complete.

## Branching Hierarchy

```
main
├── feature/phase-1-foundation
│   └── feature/mockup-creation
│       ├── feature/mockup-landing-page
│       ├── feature/mockup-auth-popup
│       ├── feature/mockup-user-profile
│       └── ... (other mockup screens)
├── feature/phase-2-auth
│   ├── feature/github-auth
│   │   ├── feature/github-auth-setup
│   │   ├── feature/github-auth-registration
│   │   └── ... (other auth sub-tasks)
│   └── feature/stripe-integration
│       ├── feature/stripe-setup
│       ├── feature/stripe-payment-methods
│       └── ... (other subscription sub-tasks)
├── feature/phase-3-frontend
│   ├── feature/dashboard-v2
│   │   ├── feature/unified-interface
│   │   ├── feature/nested-task-list
│   │   └── ... (other dashboard sub-tasks)
│   ├── feature/claude-aws
│   │   ├── feature/sse-streaming
│   │   ├── feature/chat-input
│   │   └── ... (other chat sub-tasks)
│   └── ... (other frontend tasks)
└── feature/phase-4-backend
    ├── feature/ai-integration
    │   ├── feature/ai-context-schema
    │   ├── feature/ai-file-ingestion
    │   └── ... (other AI knowledge base sub-tasks)
    └── ... (other backend tasks)
```

## Branching Rules

### 1. Branch Creation

- **Phase Branches**: Created from `main` (e.g., `feature/phase-3-frontend`)
- **Task Branches**: Created from their phase branch (e.g., `feature/dashboard-v2` from `feature/phase-3-frontend`)
- **Sub-Task Branches**: Created from their parent task branch (e.g., `feature/unified-interface` from `feature/dashboard-v2`)

### 2. Branch Naming Convention

- **Format**: `feature/[descriptive-name]`
- **Phase**: `feature/phase-X-[phase-name]`
- **Task**: `feature/[task-name]` (short, descriptive)
- **Sub-Task**: `feature/[parent-task]-[sub-task-name]` or `feature/[sub-task-name]`

### 3. Merge Flow (Bottom-Up)

```
Sub-task completed → Merge to parent task branch
                     ↓
All sub-tasks done → Merge task to phase branch
                     ↓
All tasks done → Merge phase to main
```

**Example Flow:**

1. Complete `feature/unified-interface` → Merge to `feature/dashboard-v2`
2. Complete `feature/nested-task-list` → Merge to `feature/dashboard-v2`
3. Complete all 8 dashboard sub-tasks → Merge `feature/dashboard-v2` to `feature/phase-3-frontend`
4. Complete all Phase 3 tasks → Merge `feature/phase-3-frontend` to `main`

### 4. Merge Requirements

Before merging a branch to its parent:

✅ All tests passing  
✅ Code reviewed (if applicable)  
✅ No merge conflicts  
✅ Task marked as `DONE` in task.md  
✅ All child branches merged (for parent branches)  

### 5. Branch Lifecycle

1. **Create**: Branch from parent when task status changes to `IN PROGRESS`
2. **Develop**: Make commits, push regularly
3. **Review**: Create PR to parent branch when complete
4. **Merge**: Merge to parent after approval
5. **Delete**: Delete branch after successful merge (optional, keep for reference)

## Workflow Example: Dashboard Core Task

### Initial State
```
feature/phase-3-frontend (parent)
```

### Start Dashboard Core Task
```bash
git checkout feature/phase-3-frontend
git pull origin feature/phase-3-frontend
git checkout -b feature/dashboard-v2
```

### Start Sub-Task: Unified Interface
```bash
git checkout feature/dashboard-v2
git pull origin feature/dashboard-v2
git checkout -b feature/unified-interface
# ... work on unified interface ...
git add .
git commit -m "Implement unified interface template"
git push origin feature/unified-interface
```

### Complete Sub-Task: Merge to Parent
```bash
# Create PR: feature/unified-interface → feature/dashboard-v2
# After approval and merge:
git checkout feature/dashboard-v2
git pull origin feature/dashboard-v2
git branch -d feature/unified-interface
```

### Repeat for All Sub-Tasks
- `feature/nested-task-list` → `feature/dashboard-v2`
- `feature/github-connection` → `feature/dashboard-v2`
- ... (all 8 sub-tasks)

### Complete Main Task: Merge to Phase
```bash
# All 8 sub-tasks merged to feature/dashboard-v2
# Create PR: feature/dashboard-v2 → feature/phase-3-frontend
# After approval and merge:
git checkout feature/phase-3-frontend
git pull origin feature/phase-3-frontend
git branch -d feature/dashboard-v2
```

### Complete Phase: Merge to Main
```bash
# All Phase 3 tasks merged to feature/phase-3-frontend
# Create PR: feature/phase-3-frontend → main
# After approval and merge:
git checkout main
git pull origin main
git branch -d feature/phase-3-frontend
```

## Benefits

🌳 **Clear Hierarchy** - Visual representation of task dependencies  
🔒 **Isolation** - Each task/sub-task developed independently  
🔄 **Incremental Integration** - Merge small pieces progressively  
📊 **Progress Tracking** - Branch status reflects task completion  
🛡️ **Risk Reduction** - Smaller merges = fewer conflicts  
🔍 **Easy Review** - Focused PRs for specific features  

## Branch Status Tracking

Update task.md files to reflect branch status:

| Status | Branch State | Action |
|--------|-------------|--------|
| `PENDING` | Not created | - |
| `IN PROGRESS` | Created, active development | Regular commits |
| `WAITING FOR REVIEW` | PR open to parent | Awaiting approval |
| `DONE` | Merged to parent | Branch can be deleted |

## Protected Branches

- `main` - Production-ready code, requires PR approval
- `feature/phase-X-*` - Phase branches, requires all child tasks complete

## Conflict Resolution

If conflicts occur during merge:

1. Checkout parent branch and pull latest
2. Merge parent into your branch
3. Resolve conflicts locally
4. Test thoroughly
5. Push and update PR

## Quick Reference Commands

```bash
# Create branch from parent
git checkout [parent-branch]
git pull origin [parent-branch]
git checkout -b [new-branch]

# Merge child to parent (via PR)
# 1. Push child branch
git push origin [child-branch]
# 2. Create PR on GitHub: child → parent
# 3. After merge, update local parent
git checkout [parent-branch]
git pull origin [parent-branch]
git branch -d [child-branch]

# Check branch hierarchy
git log --oneline --graph --all
```

## Notes

- Always create PRs for merges (don't merge directly)
- Keep branches up to date with parent to minimize conflicts
- Use descriptive commit messages
- Tag releases when merging phases to main
- Document any breaking changes in PR descriptions
