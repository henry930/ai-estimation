# Coding Guidelines & Workflow

This document outlines the systematic process for all coding tasks within this project.

## 1. Branching Strategy
- **Isolation**: Every task must have its own dedicated branch.
- **Creation**: Create the branch immediately before starting work on a task.
- **No Auto-Merge**: Under no circumstances should code be automatically merged into the `main` branch.

## 2. Task Definition & Refinement
- **Documentation**: Each phase, group, or individual task must have:
  - Clear Requirements / Description.
  - An AI Enquiry Prompt (for technical clarification).
  - An "Issues" tracking mechanism for project manager refinement.
- **Dynamic Updates**: If requirements change or new issues are identified, the task list and man-hour estimations must be updated immediately for all non-DONE tasks.

## 3. Explicit Activation
- **User Permission**: No task can progress to "IN PROGRESS" without explicit user authorization or a "Start" command.
- **Credit Deduction**: Be aware that starting a task may involve resource/credit usage.

## 4. Lifecycle & Review
- **Task Statuses**: Use the following status indicators:
  - `PENDING`: Task is defined but not yet authorized to start.
  - `IN PROGRESS`: Task is currently being worked on (requires user permission to enter this state).
  - `WAITING FOR REVIEW`: Work is complete and a Pull Request (PR) has been created.
  - `DONE`: Work has been reviewed and merged by the user.
- **Pull Requests**: After completing work and internal testing, create a PR for final user review. The user makes the final decision on merging.
