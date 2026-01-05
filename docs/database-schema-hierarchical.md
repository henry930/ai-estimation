# Database Schema for Hierarchical Structure

## Overview

The database schema mirrors the file-based hierarchical structure, enabling the dashboard to display nested tasks, issues, and documents dynamically.

## Core Principle: Self-Referential Hierarchy

All entities (Tasks, Issues, Documents) use **self-referential relationships** to create unlimited nesting levels.

## Prisma Schema Design

### 1. Task Model (Self-Referential)

```prisma
model Task {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  status      TaskStatus @default(PENDING)
  hours       Int?
  branch      String?
  
  // Hierarchical relationships
  parentId    String?
  parent      Task?    @relation("TaskHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Task[]   @relation("TaskHierarchy")
  
  // Phase relationship
  phaseId     String?
  phase       Phase?   @relation(fields: [phaseId], references: [id])
  
  // Project relationship
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Related entities
  issues      Issue[]
  documents   Document[]
  
  // Metadata
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([parentId])
  @@index([projectId])
  @@index([phaseId])
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  WAITING_FOR_REVIEW
  DONE
}
```

### 2. Issue Model (Nested)

```prisma
model Issue {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  status      IssueStatus @default(OPEN)
  
  // Hierarchical relationship
  parentId    String?
  parent      Issue?   @relation("IssueHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Issue[]  @relation("IssueHierarchy")
  
  // Task relationship
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  // GitHub sync
  githubIssueId Int?
  githubUrl     String?
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([taskId])
  @@index([parentId])
}

enum IssueStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}
```

### 3. Document Model (Nested)

```prisma
model Document {
  id          String   @id @default(cuid())
  title       String
  content     String?  @db.Text
  url         String?
  type        DocumentType @default(MARKDOWN)
  
  // Hierarchical relationship
  parentId    String?
  parent      Document? @relation("DocumentHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Document[] @relation("DocumentHierarchy")
  
  // Task relationship
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  // File path (mirrors file structure)
  filePath    String?
  
  // Metadata
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([taskId])
  @@index([parentId])
}

enum DocumentType {
  MARKDOWN
  LINK
  PDF
  IMAGE
}
```

### 4. Phase Model

```prisma
model Phase {
  id          String   @id @default(cuid())
  name        String
  description String?
  order       Int
  status      TaskStatus @default(PENDING)
  
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  tasks       Task[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([projectId])
}
```

## Data Structure Examples

### Example 1: Dashboard Core Task Hierarchy

```json
{
  "id": "task_dashboard_core",
  "name": "Dashboard Core",
  "parentId": null,
  "phaseId": "phase_3_frontend",
  "branch": "feature/dashboard-v2",
  "children": [
    {
      "id": "task_unified_interface",
      "name": "Unified Interface Template",
      "parentId": "task_dashboard_core",
      "branch": "feature/unified-interface",
      "children": []
    },
    {
      "id": "task_nested_list",
      "name": "Nested Task List Component",
      "parentId": "task_dashboard_core",
      "branch": "feature/nested-task-list",
      "children": []
    }
  ]
}
```

### Example 2: Nested Issues

```json
{
  "id": "issue_credit_system",
  "title": "Credit Deduction Race Condition",
  "taskId": "task_dashboard_core",
  "parentId": null,
  "children": [
    {
      "id": "issue_atomic_check",
      "title": "Implement atomic credit check",
      "taskId": "task_dashboard_core",
      "parentId": "issue_credit_system"
    },
    {
      "id": "issue_rollback",
      "title": "Add rollback mechanism",
      "taskId": "task_dashboard_core",
      "parentId": "issue_credit_system"
    }
  ]
}
```

## Database Queries

### Get Task with Full Hierarchy

```typescript
const taskWithHierarchy = await prisma.task.findUnique({
  where: { id: taskId },
  include: {
    parent: true,
    children: {
      include: {
        children: true, // Nested children
        issues: true,
        documents: true
      }
    },
    issues: {
      include: {
        children: true
      }
    },
    documents: {
      include: {
        children: true
      }
    },
    phase: true
  }
});
```

### Get All Tasks for a Phase (Tree Structure)

```typescript
const phaseTasks = await prisma.task.findMany({
  where: {
    phaseId: phaseId,
    parentId: null // Only root tasks
  },
  include: {
    children: {
      include: {
        children: {
          include: {
            children: true // 3 levels deep
          }
        }
      }
    }
  },
  orderBy: { order: 'asc' }
});
```

### Recursive Query for Unlimited Depth

```typescript
// Using Prisma's findMany with recursive CTE (PostgreSQL)
const getAllDescendants = async (taskId: string) => {
  return await prisma.$queryRaw`
    WITH RECURSIVE task_tree AS (
      SELECT * FROM "Task" WHERE id = ${taskId}
      UNION ALL
      SELECT t.* FROM "Task" t
      INNER JOIN task_tree tt ON t."parentId" = tt.id
    )
    SELECT * FROM task_tree;
  `;
};
```

## Dashboard UI Representation

### 1. Tree View Component

```typescript
interface TreeNode {
  id: string;
  name: string;
  type: 'task' | 'issue' | 'document';
  status?: TaskStatus;
  branch?: string;
  children: TreeNode[];
  metadata: {
    hours?: number;
    assignee?: string;
    issueCount?: number;
    docCount?: number;
  };
}
```

### 2. Nested Table View

```tsx
// Recursive table component
function NestedTaskTable({ tasks, level = 0 }) {
  return (
    <>
      {tasks.map(task => (
        <React.Fragment key={task.id}>
          <tr style={{ paddingLeft: `${level * 20}px` }}>
            <td>
              {level > 0 && '└─ '}
              {task.name}
            </td>
            <td>{task.status}</td>
            <td>{task.hours}h</td>
            <td>{task.branch}</td>
            <td>
              <IssueCount taskId={task.id} />
            </td>
          </tr>
          {task.children && (
            <NestedTaskTable 
              tasks={task.children} 
              level={level + 1} 
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
}
```

### 3. Breadcrumb Navigation

```tsx
function TaskBreadcrumb({ task }) {
  const breadcrumbs = [];
  let current = task;
  
  while (current) {
    breadcrumbs.unshift(current);
    current = current.parent;
  }
  
  return (
    <nav>
      {breadcrumbs.map((item, index) => (
        <span key={item.id}>
          <Link to={`/tasks/${item.id}`}>{item.name}</Link>
          {index < breadcrumbs.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  );
}
```

## File-Database Sync Strategy

### Sync Flow

1. **File → Database**: Parse task.md files and sync to database
2. **Database → File**: Generate task.md files from database records
3. **Bidirectional**: Keep both in sync with timestamps

### Sync Implementation

```typescript
async function syncTaskToDatabase(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const parsed = parseTaskMarkdown(content);
  
  await prisma.task.upsert({
    where: { filePath },
    update: {
      name: parsed.name,
      description: parsed.description,
      status: parsed.status,
      hours: parsed.hours,
      branch: parsed.branch,
      // Sync sub-tasks
      children: {
        upsert: parsed.subTasks.map(st => ({
          where: { name: st.name },
          update: st,
          create: st
        }))
      }
    },
    create: {
      filePath,
      ...parsed
    }
  });
}
```

## Benefits

✅ **Dynamic Rendering** - Dashboard displays live data from database  
✅ **Unlimited Nesting** - Self-referential design supports any depth  
✅ **Efficient Queries** - Indexed relationships for fast lookups  
✅ **File Sync** - Bidirectional sync keeps files and DB in sync  
✅ **UI Flexibility** - Tree, table, or breadcrumb views from same data  
✅ **Cascade Deletes** - Removing parent removes all children  

This creates a complete system where the hierarchical structure exists in **files**, **database**, and **UI**.
