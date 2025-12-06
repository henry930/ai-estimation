# How to Update PROJECT_PLAN.md

This guide explains how to maintain PROJECT_PLAN.md as a living document throughout the project.

---

## When to Update

### 1. More Concrete Planning
**Trigger**: When you gather more information and requirements

**What to update**:
- Refine task descriptions with more specific details
- Adjust time estimates based on new information
- Add new tasks if scope expands
- Update acceptance criteria with clearer requirements
- Modify technology stack if needed

**Example**:
```markdown
Before:
| Payment Integration | Integrate with payment system | 10 | [ ] |

After (more concrete):
| Stripe Payment Integration | Integrate Stripe Checkout with webhook handling for subscription payments | 10 | [ ] |
```

---

### 2. Task Completion
**Trigger**: When any task is finished

**What to update**:
1. Mark task status from `[ ]` to `[x]`
2. Add actual hours spent in parentheses
3. Update the "Actual vs. Estimated Tracking" table
4. Increment version number (e.g., 1.0 → 1.1)
5. Update "Last Updated" date
6. Add entry to Change Log

**Example**:
```markdown
Before:
| Next.js Setup | Initialize Next.js 14 with App Router, TypeScript, ESLint | 3 | [ ] |

After completion:
| Next.js Setup | Initialize Next.js 14 with App Router, TypeScript, ESLint | 3 (actual: 2.5) | [x] |
```

**Update tracking table**:
```markdown
| Phase 1: Foundation & Setup | 40 | 2.5 | -0.5 | 6% Complete |
```

**Add to Change Log**:
```markdown
### Version 1.1 (2025-12-07)
- Completed: Next.js Setup (2.5 hours, estimated 3 hours)
- Status: Phase 1 - 6% complete
```

---

### 3. User Requests
**Trigger**: When user requests changes, additions, or refinements

**What to update**:
- Add new tasks based on user requests
- Modify existing tasks per user feedback
- Adjust priorities or order of tasks
- Update scope and assumptions
- Recalculate total hours if needed

**Example**:
```markdown
User Request: "Add dark mode support"

Add new task:
| Dark Mode Implementation | Add dark mode toggle with theme persistence | 6 | [ ] |

Update total hours: 312 → 318
```

---

### 4. Scope Changes
**Trigger**: When project scope changes or features are added/removed

**What to update**:
- Add new phases or tasks for new features
- Remove or mark as "Cancelled" for removed features
- Update total estimation
- Document scope change in Change Log
- Update assumptions section

**Example**:
```markdown
Scope Change: Remove admin dashboard from MVP

Update:
- ~~Phase 4: Admin Dashboard (40 hours)~~ - REMOVED
- Total hours: 312 → 272
- Add to Change Log: "Removed admin dashboard from MVP scope"
```

---

### 5. Risk Mitigation
**Trigger**: When encountering blockers or needing to adjust approach

**What to update**:
- Document the blocker/risk
- Adjust task approach or breakdown
- Update time estimates if needed
- Add mitigation strategy to assumptions
- Update Change Log with issue and resolution

**Example**:
```markdown
Risk: GitHub API rate limits affecting repository analysis

Update:
- Add caching strategy task: "Implement GitHub API response caching" (4 hours)
- Update assumptions: "GitHub API caching implemented to handle rate limits"
- Total hours: 312 → 316
```

---

## Update Checklist

When updating PROJECT_PLAN.md, follow this checklist:

- [ ] Update version number in header (increment appropriately)
- [ ] Update "Last Updated" date
- [ ] Make changes to relevant sections
- [ ] Update "Actual vs. Estimated Tracking" table if tasks completed
- [ ] Add entry to Change Log with description of changes
- [ ] Recalculate total hours if tasks added/removed
- [ ] Update TASKS.md to match (keep in sync)
- [ ] Commit changes to Git with descriptive message
- [ ] Push to GitHub

---

## Version Numbering

- **Major version** (1.0 → 2.0): Significant scope changes, major milestones
- **Minor version** (1.0 → 1.1): Task completions, small additions
- **Patch version** (1.1 → 1.1.1): Small corrections, clarifications

---

## Example Update Flow

### Scenario: Completed 3 tasks in Phase 1

**Step 1**: Mark tasks as complete
```markdown
| Next.js Setup | ... | 3 (actual: 2.5) | [x] |
| Package Configuration | ... | 3 (actual: 3.5) | [x] |
| Environment Setup | ... | 2 (actual: 1.5) | [x] |
```

**Step 2**: Update header
```markdown
> **Last Updated**: 2025-12-07  
> **Version**: 1.1
```

**Step 3**: Update tracking table
```markdown
| Phase 1: Foundation & Setup | 40 | 7.5 | -0.5 | 19% Complete |
| **TOTAL** | **312** | **7.5** | **-0.5** | **2% Complete** |
```

**Step 4**: Add to Change Log
```markdown
### Version 1.1 (2025-12-07)
- Completed: Project Initialization (7.5 hours, estimated 8 hours)
- Variance: -0.5 hours (under estimate)
- Status: Phase 1 - 19% complete, Overall - 2% complete
- Next: Database Schema Design
```

**Step 5**: Commit and push
```bash
git add PROJECT_PLAN.md
git commit -m "Update PROJECT_PLAN.md: Complete project initialization tasks (v1.1)"
git push origin main
```

---

## Tips for Maintaining Accuracy

1. **Update immediately** after completing tasks (don't batch updates)
2. **Be honest** about actual hours (helps improve future estimates)
3. **Document blockers** and how they were resolved
4. **Keep TASKS.md in sync** with PROJECT_PLAN.md
5. **Review weekly** to ensure plan reflects current reality
6. **Learn from variance** - if consistently over/under estimating, adjust future tasks

---

## Automation Ideas

Consider creating scripts to:
- Auto-update version numbers
- Calculate total hours automatically
- Generate Change Log entries from Git commits
- Sync between PROJECT_PLAN.md and TASKS.md
- Create progress reports

---

**Remember**: The goal is to keep this document as an accurate reflection of the project's current state and future direction!
