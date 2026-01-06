# Database Schema Simplification Plan

## 🎯 Goal
Simplify the data structure by removing `TaskGroup` and `SubTask` models, using only `Task` with self-referencing parent-child relationships.

## 📊 Current Schema

```prisma
model Project {
  id          String      @id @default(cuid())
  name        String
  taskGroups  TaskGroup[]
}

model TaskGroup {
  id         String   @id @default(cuid())
  projectId  String
  title      String
  tasks      Task[]
  project    Project  @relation(fields: [projectId], references: [id])
}

model Task {
  id          String    @id @default(cuid())
  groupId     String
  title       String
  subtasks    SubTask[]
  group       TaskGroup @relation(fields: [groupId], references: [id])
}

model SubTask {
  id          String  @id @default(cuid())
  taskId      String
  title       String
  task        Task    @relation(fields: [taskId], references: [id])
}
```

## 🎯 New Schema

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  githubUrl   String?
  tasks       Task[]   // Direct relationship to tasks
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("projects")
}

model Task {
  id                String    @id @default(cuid())
  projectId         String
  parentId          String?   // Self-referencing for hierarchy
  title             String
  description       String?
  objective         String?   // Implementation plan content
  hours             Int?
  status            String    @default("PENDING")
  branch            String?
  aiPrompt          String?
  githubIssueNumber Int?
  order             Int       @default(0)
  level             Int       @default(0) // 0=root, 1=child, 2=grandchild, etc.
  
  // Relationships
  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent            Task?     @relation("TaskHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children          Task[]    @relation("TaskHierarchy")
  documents         TaskDocument[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([projectId])
  @@index([parentId])
  @@map("tasks")
}

model TaskDocument {
  id        String   @id @default(cuid())
  taskId    String
  title     String
  url       String
  type      String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@index([taskId])
  @@map("task_documents")
}
```

## 🔄 Migration Strategy

### Step 1: Create Migration Script

```typescript
// scripts/migrate-to-flat-tasks.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🔄 Starting migration...\n');
  
  // 1. Get all projects
  const projects = await prisma.project.findMany({
    include: {
      taskGroups: {
        include: {
          tasks: {
            include: {
              subtasks: true,
              documents: true,
            },
          },
        },
      },
    },
  });
  
  for (const project of projects) {
    console.log(`📦 Migrating project: ${project.name}`);
    
    for (const group of project.taskGroups) {
      // Create parent task from task group
      const parentTask = await prisma.task.create({
        data: {
          projectId: project.id,
          parentId: null, // Root level
          title: group.title,
          description: group.description,
          objective: group.objective,
          hours: group.totalHours,
          status: group.status || 'PENDING',
          branch: group.branch,
          githubIssueNumber: group.githubIssueNumber,
          order: group.order,
          level: 0,
        },
      });
      
      console.log(`  ✅ Created parent task: ${parentTask.title}`);
      
      // Migrate tasks as children
      for (const task of group.tasks) {
        const childTask = await prisma.task.create({
          data: {
            projectId: project.id,
            parentId: parentTask.id, // Link to parent
            title: task.title,
            description: task.description,
            objective: task.objective,
            hours: task.hours,
            status: task.status,
            branch: task.branch,
            aiPrompt: task.aiPrompt,
            githubIssueNumber: task.githubIssueNumber,
            order: task.order,
            level: 1,
          },
        });
        
        console.log(`    ✅ Created child task: ${childTask.title}`);
        
        // Migrate subtasks as grandchildren
        for (const subtask of task.subtasks) {
          await prisma.task.create({
            data: {
              projectId: project.id,
              parentId: childTask.id, // Link to parent task
              title: subtask.title,
              hours: subtask.hours || 1,
              status: subtask.isCompleted ? 'DONE' : 'PENDING',
              githubIssueNumber: subtask.githubIssueNumber,
              level: 2,
            },
          });
        }
        
        // Migrate documents
        for (const doc of task.documents) {
          await prisma.taskDocument.create({
            data: {
              taskId: childTask.id,
              title: doc.title,
              url: doc.url,
              type: doc.type,
            },
          });
        }
      }
    }
  }
  
  console.log('\n✅ Migration complete!');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Step 2: Update Prisma Schema

```bash
# 1. Backup current database
cp prisma/dev.db prisma/dev.db.backup

# 2. Update schema.prisma (remove TaskGroup, SubTask)

# 3. Create migration
npx prisma migrate dev --name simplify_to_flat_tasks

# 4. Run migration script
npx tsx scripts/migrate-to-flat-tasks.ts

# 5. Verify data
npx tsx scripts/verify-migration.ts
```

### Step 3: Update API Routes

**Before:**
```typescript
// /api/projects/[id]/tasks
const taskGroups = await prisma.taskGroup.findMany({
  where: { projectId: id },
  include: {
    tasks: {
      include: { subtasks: true }
    }
  }
});
```

**After:**
```typescript
// /api/projects/[id]/tasks
const tasks = await prisma.task.findMany({
  where: { 
    projectId: id,
    parentId: null // Get root tasks only
  },
  include: {
    children: {
      include: {
        children: true // Nested children
      }
    }
  }
});
```

### Step 4: Update UI Components

**TaskBreakdownTable.tsx:**
```typescript
// Before: TaskCategory with tasks
interface TaskCategory {
  id: string;
  title: string;
  tasks: TaskItem[];
}

// After: Recursive Task structure
interface Task {
  id: string;
  title: string;
  children: Task[]; // Recursive
}
```

## 📋 Files to Update

### Database & API
- ✅ `prisma/schema.prisma` - Update schema
- ✅ `scripts/migrate-to-flat-tasks.ts` - Create migration script
- ✅ `src/app/api/projects/[id]/tasks/route.ts` - Update to use flat tasks
- ❌ `src/app/api/groups/[groupId]/route.ts` - DELETE (no longer needed)
- ✅ `src/app/api/tasks/[taskId]/route.ts` - Update queries

### UI Components
- ✅ `src/components/dashboard/TaskBreakdownTable.tsx` - Handle recursive tasks
- ❌ `src/app/dashboard/projects/[id]/groups/[groupId]/page.tsx` - DELETE or redirect
- ✅ `src/app/dashboard/projects/[id]/tasks/[taskId]/page.tsx` - Update to show children
- ✅ `src/app/dashboard/projects/[id]/page.tsx` - Update task fetching

### Scripts
- ✅ `scripts/generate-implementation-plans.ts` - Update for flat structure
- ✅ `scripts/populate-sample-tasks.ts` - Update to create flat tasks

## 🎯 Benefits

1. **Simpler Schema**: Only one task model instead of three
2. **Flexible Hierarchy**: Unlimited nesting levels
3. **Easier Queries**: No complex joins across multiple tables
4. **Better Performance**: Fewer tables to query
5. **More Intuitive**: Tasks can have subtasks naturally

## ⚠️ Considerations

1. **Recursive Queries**: Need to handle infinite nesting
2. **Performance**: Deep nesting might require optimization
3. **UI Updates**: Need to handle variable depth in components
4. **Migration Time**: ~5-10 minutes for existing data

## 🚀 Implementation Timeline

1. **Create Migration Script** (10 min)
2. **Update Prisma Schema** (5 min)
3. **Run Migration** (5 min)
4. **Update API Routes** (15 min)
5. **Update UI Components** (20 min)
6. **Test Everything** (15 min)
7. **Commit & Push** (5 min)

**Total: ~75 minutes**

## ✅ Ready to Proceed?

This is a significant change but will make the system much simpler and more flexible going forward.

Should I proceed with this migration now?
