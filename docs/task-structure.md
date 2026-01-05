# Task Data Model - Nested Structure

## Schema Concept
To support the requirement that "each task is as same as a project", we implement a recursive data structure.

### Proposed Prisma Update (Reference Only)
```prisma
model Task {
  id          String         @id
  title       String
  description String?
  hours       Int?
  status      String         @default("PENDING")
  branch      String?
  aiPrompt    String?
  assigneeId  String?        // ID of GitHub user or "higgs-boson"
  
  // Nested structure
  parentId    String?        // Points to parent Task
  parent      Task?          @relation("SubTasks", fields: [parentId], references: [id])
  tasks       Task[]         @relation("SubTasks")
  
  // Project relations
  issues      TaskIssue[]
  documents   TaskDocument[]
}
```

## Navigation & UI
- **Table Format**: All nested task lists (To-Do tab) must use the same grid/table structure as the primary project view (Phase, Status, Hours, Branch, Detail).
- **Breadcrumbs**: For deep navigation.
- **Tree-view sidebar**: For hierarchical overview.
