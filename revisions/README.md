# Revisions Directory

This directory is for tracking revisions and improvements you want the AI to implement.

## How It Works

1. **Add Revision Notes**: Create markdown files in this directory with things you want fixed/improved
2. **Trigger Fixes**: Say "Fix Revise" or "Check Revisions" 
3. **AI Reviews**: I'll read all files here and implement the changes
4. **Mark Complete**: I'll move completed revisions to `revisions/completed/`

## File Naming Convention

Use descriptive names for easy tracking:
- `ui-improvements.md` - UI/UX fixes
- `bug-fixes.md` - Bug reports
- `feature-requests.md` - New features
- `refactoring.md` - Code improvements
- `YYYY-MM-DD-description.md` - Date-based notes

## Example Revision File

```markdown
# UI Improvements - 2026-01-08

## Dashboard
- [ ] Fix alignment on project cards
- [ ] Add loading spinner to task list
- [ ] Improve mobile responsiveness

## Chat Interface
- [ ] Make text larger
- [ ] Add copy button to code blocks

## Priority
High - Dashboard fixes
Medium - Chat improvements
```

## Status Tracking

- **Active**: Files in `revisions/` (this directory)
- **In Progress**: Marked with `[WIP]` prefix
- **Completed**: Moved to `revisions/completed/`
- **Deferred**: Moved to `revisions/deferred/`

## Tips

- ✅ Be specific about what needs fixing
- ✅ Include file paths if known
- ✅ Add screenshots or examples if helpful
- ✅ Use checkboxes `- [ ]` for tracking
- ✅ Prioritize items (High/Medium/Low)

## Workflow

1. You create/edit files in `revisions/`
2. You say "Fix Revise"
3. I read all files and implement changes
4. I mark items as done with `- [x]`
5. I move completed files to `revisions/completed/`
6. I run `./scripts/beep.sh` when done

---

**Current Status**: Ready for revisions!
