# Page Unification - Task List

## Goal
Unify the structure and tabs across Project, Task Group, and Task pages to ensure consistency.

## Current Status

### ✅ Project Page (`/dashboard/projects/[id]/page.tsx`)
**Tabs**: `implementation-plan | tasks | documents | report | agent`
- ✅ Implementation Plan tab with GitHub link
- ✅ Task List tab with TaskBreakdownTable
- ✅ Documents tab with categorized GitHub links
- ✅ Report tab with comprehensive project summary
- ✅ AI Agent tab

### ⏳ Task Group Page (`/dashboard/projects/[id]/groups/[groupId]/page.tsx`)
**Current Tabs**: `objective | issues | documents | tasks | enquiry`
**Target Tabs**: `implementation-plan | tasks | documents | report | agent`

**Changes Needed**:
1. ✅ Update tab array to match project page
2. ⏳ Replace "objective" with "implementation-plan" content
3. ⏳ Remove "issues" tab
4. ⏳ Add "report" tab
5. ⏳ Rename "enquiry" → "agent"
6. ⏳ Add GitHub link to implementation plan file

### ⏳ Task Page (`/dashboard/projects/[id]/tasks/[taskId]/page.tsx`)
**Current Tabs**: `objective | issues | documents | subtasks | enquiry`
**Target Tabs**: `implementation-plan | subtasks | documents | report | agent`

**Changes Needed**:
1. ⏳ Update tab array to match project page
2. ⏳ Replace "objective" with "implementation-plan" content
3. ⏳ Remove "issues" tab
4. ⏳ Add "report" tab
5. ⏳ Rename "enquiry" → "agent"
6. ⏳ Rename "subtasks" → keep as is (task-specific)
7. ⏳ Add GitHub link to implementation plan file

## Tab Content Structure

### Implementation Plan Tab
```tsx
{activeTab === 'implementation-plan' && (
    <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3>Implementation Plan</h3>
                    <p>Comprehensive guide for implementing this {type}</p>
                </div>
                {githubUrl && (
                    <a href={githubPlanUrl} target="_blank">
                        View Full Plan on GitHub
                    </a>
                )}
            </div>
            <div className="prose prose-invert">
                <h4>Overview</h4>
                <p>{objective || description}</p>
                
                {/* For groups: list tasks */}
                {/* For tasks: list subtasks */}
                
                <h4>Quick Links</h4>
                {/* Repository, Issues, etc. */}
            </div>
        </div>
    </div>
)}
```

### Report Tab
```tsx
{activeTab === 'report' && (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20">
        <h3>Progress Report</h3>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>Completed Tasks</div>
            <div>In Progress</div>
            <div>Pending</div>
            <div>Hours Completed</div>
        </div>
        
        {/* Task/Subtask Breakdown */}
        {/* Key Achievements */}
        {/* Next Steps */}
    </div>
)}
```

### Documents Tab
```tsx
{activeTab === 'documents' && (
    <div className="space-y-6">
        {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map(doc => (
                    <a href={doc.url} target="_blank" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50">
                        <span>{doc.title}</span>
                    </a>
                ))}
            </div>
        ) : (
            <div className="text-center py-12">
                <p>No documents linked yet</p>
            </div>
        )}
    </div>
)}
```

### AI Agent Tab
```tsx
{activeTab === 'agent' && (
    <AIEnquiryPanel
        context={{
            type: 'group' | 'task',
            id: id,
            title: title,
            objective: objective,
            // ... other context
        }}
    />
)}
```

## Implementation Plan Files

### Project
`docs/implementation-plans/project-{sanitized-name}.md`

### Task Group
`docs/implementation-plans/group-{sanitized-title}.md`

### Task
`docs/implementation-plans/task-{sanitized-title}.md`

## GitHub URL Construction

```tsx
const getImplementationPlanUrl = (type: 'project' | 'group' | 'task', name: string, githubUrl: string) => {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${githubUrl.replace('.git', '')}/blob/main/docs/implementation-plans/${type}-${sanitized}.md`;
};
```

## Next Steps

1. **Complete Task Group Page**:
   - Replace objective tab content with implementation-plan
   - Add report tab with group statistics
   - Update AI Agent panel integration
   - Add GitHub link to implementation plan

2. **Update Task Page**:
   - Same changes as task group page
   - Keep subtasks tab (task-specific)
   - Add GitHub link to task implementation plan

3. **Test All Pages**:
   - Verify tabs work correctly
   - Check GitHub links open correct files
   - Ensure consistent styling
   - Test AI Agent panel on all pages

4. **Commit & Push**:
   - Commit unified pages
   - Push to GitHub
   - Verify implementation plan links work

## Database Schema Consistency

All three page types use the same fields:
- `id`: Unique identifier
- `title`: Display name
- `description`: Short description
- `objective`: Detailed objective/plan
- `status`: Current status
- `branch`: Git branch name
- `githubIssueNumber`: Linked GitHub issue
- `documents`: Array of linked documents

This ensures consistency across all pages.
