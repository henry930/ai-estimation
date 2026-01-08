# Task Name Uniqueness - Fix Summary

**Date**: 2026-01-08  
**Issue**: Duplicate task names in database  
**Status**: ✅ RESOLVED

## Problem

The database had **3 duplicate task names**:
1. "Phase 1: Foundation & Setup" (2 instances)
2. "Phase 2: Authentication & Subscription" (2 instances)  
3. "Testing" (2 instances)

While the database uses auto-generated IDs (`cuid()`), having duplicate task names causes confusion and potential issues in the UI and API.

## Solution Implemented

### 1. Detection Script ✅
**File**: `scripts/check-duplicate-tasks.ts`

Scans the database and reports:
- All duplicate task names
- Number of instances
- Task IDs, levels, and statuses

**Usage**:
```bash
npx tsx scripts/check-duplicate-tasks.ts
```

### 2. Fix Script ✅
**File**: `scripts/fix-duplicate-tasks.ts`

Automatically fixes duplicates by:
- Keeping the first instance unchanged
- Renaming subsequent instances with suffixes: "(2)", "(3)", etc.
- Verifying no duplicates remain

**Results**:
```
✅ "Phase 1: Foundation & Setup" → "Phase 1: Foundation & Setup (2)"
✅ "Phase 2: Authentication & Subscription" → "Phase 2: Authentication & Subscription (2)"
✅ "Testing" → "Testing (2)"
```

**Usage**:
```bash
npx tsx scripts/fix-duplicate-tasks.ts
```

### 3. Prevention Helper ✅
**File**: `src/lib/unique-task-helper.ts`

Provides utility functions:
- `generateUniqueTaskTitle()` - Generates unique title with suffix if needed
- `checkTaskNameUnique()` - Checks if a title is unique

**Features**:
- Checks within project scope
- Optionally checks within parent (for subtasks)
- Auto-increments suffix: (2), (3), (4), etc.
- Safety limit of 100 attempts
- Falls back to timestamp if needed

### 4. AI Chat Integration ✅
**File**: `src/app/api/projects/[id]/chat/route.ts`

Updated `create_phase` tool to:
- Check for duplicate names before creating
- Auto-generate unique names if needed
- Log when renaming occurs

**Example**:
```typescript
// AI tries to create "Testing" phase
// But "Testing" already exists
// System creates "Testing (2)" instead
// Logs: ⚠️  Renamed duplicate: "Testing" → "Testing (2)"
```

## Verification

### Before Fix
```
Total tasks: 61
Unique titles: 58
Duplicates: 3
```

### After Fix
```
Total tasks: 61
Unique titles: 61
Duplicates: 0
```

## Prevention Strategy

### For AI Chat
- ✅ `create_phase` tool checks uniqueness
- ✅ Auto-generates unique names
- ✅ Logs renames for transparency

### For Manual Creation
Developers should:
1. Check existing task names before creating
2. Use descriptive, unique names
3. Add context if similar tasks exist

### For Future Enhancement
Consider adding:
- Database unique constraint (with project scope)
- UI validation before task creation
- Duplicate warning in frontend

## Files Created/Modified

### Scripts
1. `scripts/check-duplicate-tasks.ts` - Detection
2. `scripts/fix-duplicate-tasks.ts` - Automatic fix

### Libraries
1. `src/lib/unique-task-helper.ts` - Prevention utilities

### API Routes
1. `src/app/api/projects/[id]/chat/route.ts` - Integrated prevention

## Usage Guide

### Check for Duplicates
```bash
npx tsx scripts/check-duplicate-tasks.ts
```

### Fix Duplicates
```bash
npx tsx scripts/fix-duplicate-tasks.ts
```

### In Code
```typescript
import { generateUniqueTaskTitle } from '@/lib/unique-task-helper';

// Generate unique title
const uniqueTitle = await generateUniqueTaskTitle(
    projectId,
    'My Task Name'
);

// Create task with unique title
await prisma.task.create({
    data: {
        projectId,
        title: uniqueTitle,
        // ... other fields
    }
});
```

## Best Practices

### Task Naming
1. **Be Descriptive**: Use clear, specific names
2. **Add Context**: Include phase/category if helpful
3. **Avoid Generic Names**: "Testing", "Setup", "Implementation"
4. **Use Numbering**: "Phase 1", "Phase 2" instead of just "Phase"

### Examples
❌ **Bad**:
- "Testing"
- "Setup"
- "Development"

✅ **Good**:
- "Testing Phase - User Authentication"
- "Initial Setup - Database Configuration"
- "Development - Payment Integration"

## Monitoring

### Regular Checks
Run the detection script periodically:
```bash
# Add to CI/CD or run weekly
npx tsx scripts/check-duplicate-tasks.ts
```

### Logs
Watch for rename warnings in AI chat:
```
⚠️  Renamed duplicate: "Testing" → "Testing (2)"
```

## Future Enhancements

### Database Level
```prisma
model Task {
  // Add unique constraint
  @@unique([projectId, title])
}
```

### API Level
- Validate uniqueness in all task creation endpoints
- Return warning if name was modified

### UI Level
- Show duplicate warning before creation
- Suggest alternative names
- Display existing similar tasks

## Conclusion

✅ **All duplicate task names fixed**  
✅ **Prevention system in place**  
✅ **AI chat integrated**  
✅ **Scripts available for monitoring**  

The system now ensures task names remain unique within each project, preventing confusion and maintaining data integrity.

---

**Status**: ✅ RESOLVED  
**Maintenance**: Run check script periodically  
**Next Steps**: Consider adding database constraint
