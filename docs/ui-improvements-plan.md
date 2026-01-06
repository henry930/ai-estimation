# Implementation Plan: UI Improvements

## Completed ✅
1. **Project-level statistics** - Added total hours, progress %, task groups count, and total tasks count to project header

## To Implement

### 1. Add "Report" Tab to All Pages
- **Project Page**: Add "Report" tab showing overall project summary
- **Task Group Page**: Add "Report" tab showing phase summary  
- **Task Page**: Add "Report" tab showing what was done and changed

### 2. Rename Tabs Consistently
- Change "enquiry" → "AI Agent" everywhere
- Update tab labels to be consistent across all pages

### 3. Document Classification System
- Scan `docs/` directory
- Classify documents by topic/phase
- Link documents to appropriate task groups/tasks
- Display in "Documents" tab with proper categorization

### 4. Report Generation
For each task, generate a report showing:
- **Objective**: What the task aimed to achieve
- **Implementation**: What was actually done
- **Changes**: Files modified, features added
- **Status**: Current completion status
- **Next Steps**: What remains to be done

## Files to Modify

### Project Page
- `/src/app/dashboard/projects/[id]/page.tsx`
  - ✅ Added statistics
  - ⏳ Add "Report" tab
  - ⏳ Rename "agent" → "AI Agent"
  - ⏳ Implement document classification

### Task Group Page  
- `/src/app/dashboard/projects/[id]/groups/[groupId]/page.tsx`
  - ⏳ Add "Report" tab
  - ⏳ Rename "enquiry" → "AI Agent"
  - ⏳ Add progress bar (already has it)

### Task Page
- `/src/app/dashboard/projects/[id]/tasks/[taskId]/page.tsx`
  - ⏳ Add "Report" tab
  - ⏳ Rename "enquiry" → "AI Agent"  
  - ⏳ Add progress bar (already has it)

## Document Classification Strategy

### Categories
1. **Setup & Configuration**
   - GITHUB_OAUTH_SETUP.md
   - github-oauth-setup-simple.md
   - github-oauth-production-setup.md
   - custom-domain-setup.md
   - production-setup-guide.md

2. **Architecture & Design**
   - database-schema-hierarchical.md
   - complete-hierarchical-structure.md
   - dashboard-ui-hierarchical.md
   - git-branching-strategy.md

3. **Development Guides**
   - standard-development-procedures.md
   - task-management-workflow.md
   - TESTING-GUIDE.md

4. **Implementation Status**
   - implementation-status.md
   - merge-history.md
   - active-branches.md

5. **Features**
   - auth-flow.md
   - credit-system.md
   - aws-claude-integration.md
   - ai-knowledge-base.md

### Mapping to Task Groups
- Phase 1 (Foundation) → Setup & Configuration docs
- Phase 2 (Auth) → auth-flow.md, OAuth docs
- Phase 3 (Frontend) → dashboard-ui-hierarchical.md
- Phase 4 (Backend) → database-schema-hierarchical.md
- Phase 5 (GitHub) → git-branching-strategy.md, GitHub docs
