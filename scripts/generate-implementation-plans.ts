import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function generateImplementationPlans() {
    console.log('📝 Generating Implementation Plans...\n');

    // Create implementation-plans directory
    const plansDir = path.join(process.cwd(), 'docs', 'implementation-plans');
    if (!fs.existsSync(plansDir)) {
        fs.mkdirSync(plansDir, { recursive: true });
    }

    // Get all projects
    const projects = await prisma.project.findMany({
        include: {
            taskGroups: {
                include: {
                    tasks: {
                        include: {
                            subtasks: true,
                        },
                    },
                },
            },
        },
    });

    for (const project of projects) {
        console.log(`\n📦 Project: ${project.name}`);

        // Create project implementation plan
        const projectPlan = generateProjectPlan(project);
        const projectFile = path.join(plansDir, `project-${sanitizeFilename(project.name)}.md`);
        fs.writeFileSync(projectFile, projectPlan);
        console.log(`   ✅ Created: ${path.basename(projectFile)}`);

        for (const group of project.taskGroups) {
            // Create task group implementation plan
            const groupPlan = generateTaskGroupPlan(group, project);
            const groupFile = path.join(plansDir, `group-${sanitizeFilename(group.title)}.md`);
            fs.writeFileSync(groupFile, groupPlan);
            console.log(`   ✅ Created: ${path.basename(groupFile)}`);

            for (const task of group.tasks) {
                // Create task implementation plan
                const taskPlan = generateTaskPlan(task, group, project);
                const taskFile = path.join(plansDir, `task-${sanitizeFilename(task.title)}.md`);
                fs.writeFileSync(taskFile, taskPlan);
                console.log(`      ✅ Created: ${path.basename(taskFile)}`);
            }
        }
    }

    console.log('\n✨ All implementation plans generated!');
}

function sanitizeFilename(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generateProjectPlan(project: any): string {
    const totalTasks = project.taskGroups.reduce((acc: number, g: any) => acc + g.tasks.length, 0);
    const totalHours = project.taskGroups.reduce((acc: number, g: any) =>
        acc + g.tasks.reduce((sum: number, t: any) => sum + (t.hours || 0), 0), 0
    );

    return `# Implementation Plan: ${project.name}

## Project Overview

**Description**: ${project.description || 'No description provided'}

**Repository**: ${project.githubUrl || 'Not linked'}

**Statistics**:
- Task Groups: ${project.taskGroups.length}
- Total Tasks: ${totalTasks}
- Estimated Hours: ${totalHours}h

## Objectives

${project.description || 'Build a comprehensive solution that meets all requirements and delivers value to users.'}

## Implementation Strategy

### Phase Overview

${project.taskGroups.map((group: any, index: number) => `
#### Phase ${index + 1}: ${group.title}
- **Tasks**: ${group.tasks.length}
- **Hours**: ${group.tasks.reduce((sum: number, t: any) => sum + (t.hours || 0), 0)}h
- **Status**: ${group.status || 'PENDING'}
- **Objective**: ${group.objective || 'Complete all tasks in this phase'}
`).join('\n')}

## Development Workflow

1. **Setup Phase**
   - Clone repository
   - Install dependencies
   - Configure environment variables
   - Set up database

2. **Implementation Phase**
   - Work through task groups sequentially
   - Create feature branches for each task
   - Write tests for new functionality
   - Document changes

3. **Testing Phase**
   - Unit tests for all components
   - Integration tests for API endpoints
   - End-to-end tests for critical flows
   - Performance testing

4. **Deployment Phase**
   - Build production bundle
   - Run migrations
   - Deploy to staging
   - Verify functionality
   - Deploy to production

## Success Criteria

- ✅ All tasks completed
- ✅ All tests passing
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ Successfully deployed to production

## Risk Management

### Potential Risks
1. **Technical Complexity**: Some features may be more complex than estimated
2. **Dependencies**: External API changes or library updates
3. **Integration**: Challenges integrating with third-party services

### Mitigation Strategies
1. Break down complex tasks into smaller subtasks
2. Pin dependency versions and test updates thoroughly
3. Create abstraction layers for external integrations

## Timeline

Estimated completion: ${Math.ceil(totalHours / 40)} weeks (based on 40 hours/week)

## Resources

- [Project Repository](${project.githubUrl || '#'})
- [Documentation](${project.githubUrl ? `${project.githubUrl.replace('.git', '')}/blob/main/README.md` : '#'})
- [Issue Tracker](${project.githubUrl ? `${project.githubUrl.replace('.git', '')}/issues` : '#'})

---

*Last Updated: ${new Date().toISOString().split('T')[0]}*
`;
}

function generateTaskGroupPlan(group: any, project: any): string {
    const totalHours = group.tasks.reduce((sum: number, t: any) => sum + (t.hours || 0), 0);

    return `# Implementation Plan: ${group.title}

## Overview

**Project**: ${project.name}

**Phase**: ${group.title}

**Status**: ${group.status || 'PENDING'}

**Estimated Hours**: ${totalHours}h

**Branch**: ${group.branch || 'Not created'}

## Objective

${group.objective || group.description || 'Complete all tasks in this phase to achieve the phase goals.'}

## Tasks Breakdown

${group.tasks.map((task: any, index: number) => `
### ${index + 1}. ${task.title}

**Hours**: ${task.hours || 0}h | **Status**: ${task.status || 'PENDING'} | **Branch**: ${task.branch || 'TBD'}

${task.objective || task.description || 'Complete this task as specified.'}

${task.subtasks && task.subtasks.length > 0 ? `
**Subtasks**:
${task.subtasks.map((st: any) => `- [${st.isCompleted ? 'x' : ' '}] ${st.title}`).join('\n')}
` : ''}
`).join('\n')}

## Implementation Steps

1. **Preparation**
   - Review all task requirements
   - Set up development environment
   - Create feature branch: \`${group.branch || 'feature/' + sanitizeFilename(group.title)}\`

2. **Development**
   - Implement tasks in order
   - Write unit tests for each component
   - Document code changes
   - Commit regularly with clear messages

3. **Testing**
   - Run all tests
   - Manual testing of new features
   - Fix any bugs discovered
   - Performance testing if applicable

4. **Review**
   - Self-review code changes
   - Create pull request
   - Address review comments
   - Merge to main branch

## Dependencies

- Previous phases must be completed
- Required tools and libraries installed
- Database migrations applied
- Environment variables configured

## Success Criteria

${group.tasks.map((task: any) => `- ✅ ${task.title} completed and tested`).join('\n')}

## Notes

- Follow project coding standards
- Update documentation as you go
- Communicate blockers early
- Test thoroughly before marking complete

---

*Last Updated: ${new Date().toISOString().split('T')[0]}*
`;
}

function generateTaskPlan(task: any, group: any, project: any): string {
    return `# Implementation Plan: ${task.title}

## Task Information

**Project**: ${project.name}

**Phase**: ${group.title}

**Estimated Hours**: ${task.hours || 0}h

**Status**: ${task.status || 'PENDING'}

**Branch**: ${task.branch || 'Not created'}

## Objective

${task.objective || task.description || 'Complete this task according to specifications.'}

## Implementation Steps

### 1. Setup

\`\`\`bash
# Create feature branch
git checkout -b ${task.branch || 'feature/' + sanitizeFilename(task.title)}

# Ensure dependencies are installed
npm install
\`\`\`

### 2. Development

${task.subtasks && task.subtasks.length > 0 ? `
**Subtasks to Complete**:

${task.subtasks.map((st: any, index: number) => `
#### ${index + 1}. ${st.title}

- [ ] Implement functionality
- [ ] Write tests
- [ ] Update documentation
- [ ] Verify it works

**Estimated**: ${st.hours || 1}h
`).join('\n')}
` : `
**Implementation Checklist**:

- [ ] Understand requirements
- [ ] Design solution
- [ ] Write code
- [ ] Add tests
- [ ] Update documentation
- [ ] Manual testing
`}

### 3. Testing

\`\`\`bash
# Run tests
npm test

# Run linter
npm run lint

# Build to verify
npm run build
\`\`\`

### 4. Documentation

- Update relevant README files
- Add inline code comments
- Document any API changes
- Update changelog if applicable

### 5. Review & Merge

\`\`\`bash
# Commit changes
git add .
git commit -m "feat: ${task.title}"

# Push to remote
git push origin ${task.branch || 'feature/' + sanitizeFilename(task.title)}

# Create pull request on GitHub
# Request review from team
# Address feedback
# Merge when approved
\`\`\`

## Technical Details

### Files to Modify

- TBD (identify during implementation)

### New Files to Create

- TBD (identify during implementation)

### Dependencies

- Existing codebase
- Required npm packages
- Database schema (if applicable)

## Testing Strategy

### Unit Tests

- Test individual functions
- Mock external dependencies
- Verify edge cases

### Integration Tests

- Test component interactions
- Verify API endpoints
- Test database operations

### Manual Testing

- Test in development environment
- Verify UI/UX works as expected
- Test on different browsers/devices

## Acceptance Criteria

- ✅ All subtasks completed
- ✅ Tests passing
- ✅ Code reviewed
- ✅ Documentation updated
- ✅ No regressions introduced

## Notes

${task.aiPrompt ? `
### AI Context

${task.aiPrompt}
` : ''}

### Tips

- Break down complex logic into smaller functions
- Write tests before implementation (TDD)
- Commit frequently with clear messages
- Ask for help if blocked

## Related Resources

- [Task Group Plan](./group-${sanitizeFilename(group.title)}.md)
- [Project Plan](./project-${sanitizeFilename(project.name)}.md)
${task.branch ? `- [GitHub Branch](${project.githubUrl ? `${project.githubUrl.replace('.git', '')}/tree/${task.branch}` : '#'})` : ''}

---

*Last Updated: ${new Date().toISOString().split('T')[0]}*
`;
}

// Run the script
generateImplementationPlans()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
