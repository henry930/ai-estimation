/**
 * Prevent duplicate task names in AI chat tool execution
 * This helper checks if a task name already exists before creating
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateUniqueTaskTitle(
    projectId: string,
    baseTitle: string,
    parentId?: string
): Promise<string> {
    // Check if title exists
    const existing = await prisma.task.findFirst({
        where: {
            projectId,
            title: baseTitle,
            ...(parentId ? { parentId } : {})
        }
    });

    if (!existing) {
        return baseTitle;
    }

    // Title exists, find a unique suffix
    let counter = 2;
    let uniqueTitle = `${baseTitle} (${counter})`;

    while (true) {
        const exists = await prisma.task.findFirst({
            where: {
                projectId,
                title: uniqueTitle,
                ...(parentId ? { parentId } : {})
            }
        });

        if (!exists) {
            return uniqueTitle;
        }

        counter++;
        uniqueTitle = `${baseTitle} (${counter})`;

        // Safety limit
        if (counter > 100) {
            return `${baseTitle} (${Date.now()})`;
        }
    }
}

export async function checkTaskNameUnique(
    projectId: string,
    title: string,
    parentId?: string
): Promise<boolean> {
    const existing = await prisma.task.findFirst({
        where: {
            projectId,
            title,
            ...(parentId ? { parentId } : {})
        }
    });

    return !existing;
}
