# Dashboard UI for Hierarchical Structure

## Overview

The dashboard displays the hierarchical structure of tasks, issues, and documents in an intuitive, navigable interface.

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Estimation System                          [User] [Credits] │
├──────────┬──────────────────────────────────────────────────────┤
│          │  Project: AI Estimation System                       │
│ Projects │  ┌────────────────────────────────────────────────┐ │
│ ────────│  │ Description │ Issues │ Documents │ Tasks      │ │
│ > My AI  │  └────────────────────────────────────────────────┘ │
│   Estim. │                                                       │
│          │  ┌─ Tasks ──────────────────────────────────────┐   │
│ Settings │  │                                               │   │
│          │  │ Phase 3: Frontend Development        [60%]   │   │
│ Usage    │  │ ├─ Dashboard Core (IN PROGRESS)     [0%]     │   │
│          │  │ │  ├─ 📋 Unified Interface (PENDING)         │   │
│          │  │ │  │  ├─ 🐛 2 issues                         │   │
│          │  │ │  │  └─ 📄 1 document                       │   │
│          │  │ │  ├─ 📋 Nested Task List (PENDING)          │   │
│          │  │ │  │  ├─ 🐛 1 issue                          │   │
│          │  │ │  │  └─ 📄 2 documents                      │   │
│          │  │ │  └─ 📋 GitHub Connection (PENDING)         │   │
│          │  │ │     └─ 🐛 1 issue                          │   │
│          │  │ ├─ Chat Experience (IN PROGRESS)    [0%]     │   │
│          │  │ │  ├─ 📋 SSE Streaming (PENDING)             │   │
│          │  │ │  └─ 📋 Chat Input (PENDING)                │   │
│          │  │ └─ Mockup Consolidation (DONE)     [100%]    │   │
│          │  │                                               │   │
│          │  └───────────────────────────────────────────────┘   │
│          │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Nested Task Tree

**Features:**
- Expandable/collapsible nodes
- Visual indentation for hierarchy
- Status badges (PENDING, IN PROGRESS, DONE)
- Progress bars at each level
- Issue and document counts
- Click to navigate to detail view

```tsx
interface TaskTreeNode {
  id: string;
  name: string;
  status: TaskStatus;
  progress: number;
  branch?: string;
  issueCount: number;
  documentCount: number;
  children: TaskTreeNode[];
  level: number;
}

function TaskTree({ node, level = 0 }: { node: TaskTreeNode; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div style={{ paddingLeft: `${level * 20}px` }}>
      <div className="task-row">
        {node.children.length > 0 && (
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? '▼' : '▶'}
          </button>
        )}
        
        <span className="task-icon">
          {level === 0 ? '📁' : '📋'}
        </span>
        
        <Link to={`/tasks/${node.id}`}>{node.name}</Link>
        
        <StatusBadge status={node.status} />
        
        <ProgressBar value={node.progress} />
        
        {node.issueCount > 0 && (
          <span className="issue-count">🐛 {node.issueCount}</span>
        )}
        
        {node.documentCount > 0 && (
          <span className="doc-count">📄 {node.documentCount}</span>
        )}
      </div>
      
      {expanded && node.children.map(child => (
        <TaskTree key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
}
```

### 2. Task Detail View (Unified Interface)

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard Core                                   [Edit]    │
│  feature/dashboard-v2                                       │
│  Parent: Phase 3 Frontend > Dashboard Core                 │
├─────────────────────────────────────────────────────────────┤
│  [Description] [Issues (5)] [Documents (3)] [Sub-Tasks (8)]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ## Sub-Tasks                                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Task                    Status    Hours  Branch     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Unified Interface       PENDING   6      feature/.. │   │
│  │ ├─ 🐛 Layout Issue                                  │   │
│  │ └─ 📄 API Spec                                      │   │
│  │ Nested Task List        PENDING   8      feature/.. │   │
│  │ └─ 🐛 Performance                                   │   │
│  │ GitHub Connection       PENDING   4      feature/.. │   │
│  │ ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Issues Tab (Nested Display)

```
┌─────────────────────────────────────────────────────────────┐
│  Issues (5)                                    [+ New Issue]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🐛 Credit Deduction Race Condition              [OPEN]    │
│     └─ 🐛 Implement atomic credit check         [OPEN]    │
│     └─ 🐛 Add rollback mechanism                [OPEN]    │
│                                                             │
│  🐛 Nested Task Hierarchy Display                [OPEN]    │
│     └─ 🐛 Deep nesting performance              [OPEN]    │
│                                                             │
│  Sub-task Issues:                                           │
│  ├─ Unified Interface/                                      │
│  │  └─ 🐛 Layout responsiveness                 [OPEN]    │
│  └─ Nested Task List/                                       │
│     └─ 🐛 Rendering optimization                [OPEN]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Documents Tab (Nested Display)

```
┌─────────────────────────────────────────────────────────────┐
│  Documents (3)                              [+ New Document]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📁 Task-level Documents                                    │
│  ├─ 📄 Dashboard Architecture                              │
│  ├─ 📄 Data Model Specification                            │
│  └─ 📄 Credit System Design                                │
│                                                             │
│  📁 Sub-task Documents                                      │
│  ├─ Unified Interface/                                      │
│  │  ├─ 📄 Component API Specification                      │
│  │  └─ 📄 Design Mockups                                   │
│  ├─ Nested Task List/                                       │
│  │  └─ 📄 Rendering Optimization Guide                     │
│  └─ GitHub Connection/                                      │
│     └─ 📄 OAuth Integration Flow                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Loading Task with Hierarchy

```typescript
// API Route: /api/tasks/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      parent: true,
      children: {
        include: {
          issues: true,
          documents: true,
          children: true // Nested children
        }
      },
      issues: {
        include: {
          children: true // Nested issues
        }
      },
      documents: {
        include: {
          children: true // Nested documents
        }
      },
      phase: true
    }
  });
  
  return Response.json(task);
}
```

### Rendering Recursive Tree

```typescript
function buildTaskTree(tasks: Task[]): TaskTreeNode[] {
  const taskMap = new Map<string, TaskTreeNode>();
  const rootTasks: TaskTreeNode[] = [];
  
  // First pass: create all nodes
  tasks.forEach(task => {
    taskMap.set(task.id, {
      ...task,
      children: [],
      issueCount: task.issues.length,
      documentCount: task.documents.length,
      progress: calculateProgress(task)
    });
  });
  
  // Second pass: build hierarchy
  tasks.forEach(task => {
    const node = taskMap.get(task.id)!;
    if (task.parentId) {
      const parent = taskMap.get(task.parentId);
      parent?.children.push(node);
    } else {
      rootTasks.push(node);
    }
  });
  
  return rootTasks;
}
```

## Interactive Features

### 1. Drag & Drop Reordering

```typescript
function onDragEnd(result: DropResult) {
  if (!result.destination) return;
  
  const items = Array.from(tasks);
  const [reordered] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reordered);
  
  // Update order in database
  await updateTaskOrder(items.map((item, index) => ({
    id: item.id,
    order: index
  })));
}
```

### 2. Inline Editing

```typescript
function TaskRow({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  
  if (editing) {
    return (
      <input
        value={task.name}
        onChange={(e) => updateTask(task.id, { name: e.target.value })}
        onBlur={() => setEditing(false)}
      />
    );
  }
  
  return (
    <span onDoubleClick={() => setEditing(true)}>
      {task.name}
    </span>
  );
}
```

### 3. Breadcrumb Navigation

```typescript
function TaskBreadcrumb({ taskId }: { taskId: string }) {
  const breadcrumbs = useBreadcrumbs(taskId);
  
  return (
    <nav className="breadcrumb">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.id}>
          <Link to={`/tasks/${item.id}`}>{item.name}</Link>
          {index < breadcrumbs.length - 1 && <span> &gt; </span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

function useBreadcrumbs(taskId: string) {
  const [breadcrumbs, setBreadcrumbs] = useState<Task[]>([]);
  
  useEffect(() => {
    async function loadBreadcrumbs() {
      const path = await fetch(`/api/tasks/${taskId}/breadcrumbs`).then(r => r.json());
      setBreadcrumbs(path);
    }
    loadBreadcrumbs();
  }, [taskId]);
  
  return breadcrumbs;
}
```

## Visual Indicators

### Status Colors

- `PENDING` - Gray (#6B7280)
- `IN_PROGRESS` - Blue (#3B82F6)
- `WAITING_FOR_REVIEW` - Yellow (#F59E0B)
- `DONE` - Green (#10B981)

### Icons

- 📁 Phase/Task Group
- 📋 Task
- 🐛 Issue
- 📄 Document
- ✅ Completed
- ⏳ In Progress
- 👤 Assignee

## Mobile Responsive

```tsx
function ResponsiveTaskView() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return <TaskCardView />; // Card-based layout
  }
  
  return <TaskTreeView />; // Tree layout
}
```

This creates a complete dashboard UI that mirrors the hierarchical structure in the database and files.
