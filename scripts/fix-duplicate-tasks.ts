/**
 * Fix duplicate task names by adding unique suffixes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateTaskNames() {
    console.log('🔧 Fixing duplicate task names...\n');

    // Get all tasks grouped by title
    const tasks = await prisma.task.findMany({
        select: {
            id: true,
            title: true,
            projectId: true,
            level: true,
            status: true,
            createdAt: true,
        },
        orderBy: [
            { title: 'asc' },
            { createdAt: 'asc' }
        ]
    });

    // Group by title
    const grouped = tasks.reduce((acc, task) => {
        if (!acc[task.title]) {
            acc[task.title] = [];
        }
        acc[task.title].push(task);
        return acc;
    }, {} as Record<string, typeof tasks>);

    // Find and fix duplicates
    const duplicates = Object.entries(grouped).filter(([_, tasks]) => tasks.length > 1);

    if (duplicates.length === 0) {
        console.log('✅ No duplicate task names found!');
        await prisma.$disconnect();
        return;
    }

    console.log(`Found ${duplicates.length} duplicate task names. Fixing...\n`);

    for (const [title, duplicateTasks] of duplicates) {
        console.log(`📌 Fixing "${title}" (${duplicateTasks.length} instances):`);

        // Keep the first one as-is, rename the rest
        for (let i = 1; i < duplicateTasks.length; i++) {
            const task = duplicateTasks[i];
            const newTitle = `${title} (${i + 1})`;

            await prisma.task.update({
                where: { id: task.id },
                data: { title: newTitle }
            });

            console.log(`   ✅ Renamed: "${title}" → "${newTitle}"`);
            console.log(`      ID: ${task.id.substring(0, 8)}... | Status: ${task.status}`);
        }
        console.log('');
    }

    console.log('\n✅ All duplicates fixed!');
    console.log('\n📊 Verification:');

    // Verify no duplicates remain
    const verifyTasks = await prisma.task.findMany({
        select: { title: true }
    });

    const verifyGrouped = verifyTasks.reduce((acc, task) => {
        acc[task.title] = (acc[task.title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const remainingDuplicates = Object.entries(verifyGrouped).filter(([_, count]) => count > 1);

    if (remainingDuplicates.length === 0) {
        console.log('✅ No duplicates remaining!');
    } else {
        console.log(`⚠️  Still found ${remainingDuplicates.length} duplicates`);
    }

    await prisma.$disconnect();
}

fixDuplicateTaskNames().catch(console.error);
