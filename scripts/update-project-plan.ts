import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const projects = await prisma.project.findMany();
        console.log('--- Projects ---');
        projects.forEach(p => {
            console.log(`ID: ${p.id} | Name: ${p.name}`);
        });

        // Specifically look for the AI Project
        const targetProject = projects.find(p => p.name.includes("AI Project") || p.name.includes("Estimation"));

        if (targetProject) {
            console.log(`\nFound target project: ${targetProject.name} (${targetProject.id})`);

            // New Plan Content
            const newObjective = `
# Project Plan: AI Project Management System

## Overview
This project aims to build an AI-powered project management system where the AI understands all requirements, requests, and comments to create plans, task lists, and estimations. It includes automated report generation and documentation.

## Key Features

### 1. AI-Driven Planning
- AI parses user input to generate task structures.
- Automatic hour estimation and refinement.

### 2. Issues & Task Management (Updated)
- **GitHub Integration**: Issues tab mirrors GitHub Issues but attached to specific Tasks.
- **Classification**: Issues are classified by individual tasks.
- **Creation**: Users can create new issues directly within the system.
- **Task Parity**: Issues are treated as tasks (Managed with Branch, Status, Comments).
- **AI Reporting**: AI generates a completion report after an issue/task is Done.
- **Review Flow**: 
  - User reviews output.
  - Updates status to "Verified".
  - System automatically merges the branch to main.
  - System updates status to "Closed".

### 3. Documentation & Reporting
- Auto-generated reports upon task completion. 
- Integrated document viewing.
            `.trim();

            await prisma.project.update({
                where: { id: targetProject.id },
                data: { objective: newObjective }
            });

            console.log('✅ Updated project plan (objective) in the database.');
        } else {
            console.log('❌ Could not find the AI Project to update.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
