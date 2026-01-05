# Dashboard Core - Design & Requirements

## Overview
The Dashboard Core is the central hub for users to manage their software projects and the individual tasks within them.

## Key Features

### 1. Project Management
- **Project List**: A high-level view of all user projects.
- **Connect GitHub**: Integration to link projects to specific GitHub repositories.
- **Project Detail View**: Tabs for Description/Requirements, Issues, Documents, and a Nested Task List (To-Do).

### 2. Unified Recursive Structure
- **Recursive Model**: Every task within a project acts like a sub-project. Consequently, the **Project Page** and the **Task Detail Page** are identical in layout and functionality.
- **Common Properties**: Both entities feature:
    - **Header**: Displays the Project or Task name.
    - **Description Tab**: Detailed technical specifications/requirements.
    - **Issues Tab**: Synced directly with GitHub issues for the specific project/task branch.
    - **Documentation Tab**: Linked .md files or external URLs.
    - **To-Do Tab**: A nested task list using the standardized table format (Phase, Status, Hours, etc.).

### 3. Task Execution
- **Branch Strategy**: A dedicated git branch is created when a task moves to `IN PROGRESS`.
- **Assignees**:
    - **GitHub Users**: Manual assignment to team members.
    - **Higgs Boson**: The platform's AI agent. Assigning to Higgs Boson triggers automated implementation steps.
- **Credit System**: 
    - Usage of "Higgs Boson" consumes account credits.
    - Credit deduction occurs upon task assignment and activation.

## Layout Framework
- **Primary Sidebar**: Global navigation (Projects, Settings, Usage).
- **Secondary Sidebar**: Task tree navigation (Project > Task > Sub-task).
- **Main View**: Tabbed interface for the selected project or task.
