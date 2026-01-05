# Authentication System

**Phase**: Phase 2 - Authentication & Subscription  
**Status**: IN PROGRESS  
**Estimated Hours**: 24  
**Parent Branch**: `feature/phase-2-auth`  
**Main Branch**: `feature/github-auth`

## Description

Exclusively GitHub-based authentication system. New users without GitHub accounts are redirected to GitHub for registration. Implements a granular permission model: rather than broad initial access, permissions are requested individually for each repository during project creation.

## Sub-Tasks

| Task | Status | Hours | Branch | Assignee | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NextAuth.js GitHub Provider Setup | PENDING | 4 | `feature/nextauth-setup` | - | Configure OAuth app |
| User Registration Flow | PENDING | 4 | `feature/user-registration` | - | Redirect non-GH users to GitHub |
| Session Management | PENDING | 3 | `feature/session-management` | - | JWT tokens and refresh logic |
| Per-Repo Permission Request | PENDING | 6 | `feature/repo-permissions` | - | OAuth scope escalation during project creation |
| Permission Validation Middleware | PENDING | 4 | `feature/permission-middleware` | - | Check repo access before operations |
| User Profile Integration | PENDING | 3 | `feature/profile-integration` | - | Sync GitHub profile data |

## Issues

- [ ] Redirect logic for non-GH users
- [ ] Per-repo OAuth scope escalation/request for new projects
- [ ] Handle OAuth token expiration and refresh
- [ ] Store and validate repository permissions in database

## Documents

- [Authentication Flow](https://github.com/henry930/ai-estimation/blob/main/docs/auth-flow.md)

## AI Enquiry Prompts

- "How can I implement incremental OAuth scope requests in NextAuth.js?"
- "What's the best way to handle GitHub OAuth token refresh in a Next.js app?"

## Progress

**Overall**: 0% (0/6 sub-tasks completed)

```
[----------] 0%
```
