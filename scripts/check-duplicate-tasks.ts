/**
 * Check for duplicate task names in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicateTaskNames() {
    console.log('🔍 Checking for duplicate task names...\n');

    // Get all tasks grouped by title
    const tasks = await prisma.task.findMany({
        select: {
            id: true,
            title: true,
            projectId: true,
            level: true,
            status: true,
        },
        orderBy: {
            title: 'asc'
        }
    });

    // Group by title
    const grouped = tasks.reduce((acc, task) => {
        if (!acc[task.title]) {
            acc[task.title] = [];
        }
        acc[task.title].push(task);
        return acc;
    }, {} as Record<string, typeof tasks>);

    // Find duplicates
    const duplicates = Object.entries(grouped).filter(([_, tasks]) => tasks.length > 1);

    if (duplicates.length === 0) {
        console.log('✅ No duplicate task names found!');
        console.log(`Total unique task names: ${Object.keys(grouped).length}`);
    } else {
        console.log(`❌ Found ${duplicates.length} duplicate task names:\n`);

        for (const [title, tasks] of duplicates) {
            console.log(`📌 "${title}" (${tasks.length} instances):`);
            for (const task of tasks) {
                console.log(`   - ID: ${task.id.substring(0, 8)}... | Level: ${task.level} | Status: ${task.status}`);
            }
            console.log('');
        }

        console.log('\n⚠️  Recommendation: Rename duplicate tasks to make them unique');
        console.log('Example: "Testing Phase" → "Testing Phase 1", "Testing Phase 2"');
    }

    // Show statistics
    console.log('\n📊 Task Statistics:');
    console.log(`Total tasks: ${tasks.length}`);
    console.log(`Unique titles: ${Object.keys(grouped).length}`);
    console.log(`Duplicates: ${duplicates.length}`);

    await prisma.$disconnect();
}

checkDuplicateTaskNames().catch(console.error);
