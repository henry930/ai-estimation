# Estimation Engine

**Phase**: Phase 4 - Backend API & AI Integration  
**Status**: PENDING  
**Estimated Hours**: 28  
**Parent Branch**: `feature/phase-4-backend`  
**Main Branch**: `feature/estimation-logic`

## Description

The core logic that transforms text/files into structured JSON for tasks. Uses Claude Sonnet 4.5 to analyze requirements and generate detailed task breakdowns with hour estimates, dependencies, and implementation guidance.

## Sub-Tasks

| Task | Status | Hours | Branch | Assignee | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Prompt Template Design | PENDING | 4 | `feature/prompt-templates` | - | Create effective prompts for task extraction |
| File Parser | PENDING | 5 | `feature/file-parser` | - | Support PDF, MD, TXT, DOCX formats |
| Claude Integration | PENDING | 6 | `feature/claude-integration` | - | AWS Bedrock API calls with streaming |
| JSON Schema Validation | PENDING | 3 | `feature/schema-validation` | - | Validate AI-generated task structures |
| Context Window Management | PENDING | 5 | `feature/context-management` | - | Handle very long documents with chunking |
| Task Dependency Analysis | PENDING | 3 | `feature/dependency-analysis` | - | Identify and link related tasks |
| Estimation API Endpoint | PENDING | 2 | `feature/estimation-api` | - | REST API for estimation requests |

## Issues

- [ ] Need to handle very long context windows
- [ ] Validate AI-generated task structures for completeness
- [ ] Implement retry logic for failed API calls
- [ ] Optimize prompt engineering for accurate hour estimates

## Documents

- [Estimation Engine Design](https://github.com/henry930/ai-estimation/blob/main/docs/estimation-engine.md)

## AI Enquiry Prompts

- "Give me a prompt template for extracting technical tasks from a PDF requirements document."
- "How can I optimize Claude prompts to generate more accurate hour estimates?"

## Progress

**Overall**: 0% (0/7 sub-tasks completed)

```
[----------] 0%
```
