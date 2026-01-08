/**
 * Fix generic document titles by making them more descriptive
 * Adds task context to generic titles like "Completion Report"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixGenericDocumentTitles() {
    console.log('🔧 Fixing generic document titles...\n');

    // Get all documents with their task info
    const documents = await prisma.taskDocument.findMany({
        include: {
            task: {
                select: {
                    id: true,
                    title: true,
                    level: true,
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    console.log(`📊 Total documents: ${documents.length}\n`);

    // Generic titles to fix
    const genericTitles = [
        'Completion Report',
        'Implementation Plan',
        'Architecture Doc',
        'Technical Spec',
        'README',
        'Documentation',
        'Notes',
        'Summary'
    ];

    let fixed = 0;

    for (const doc of documents) {
        // Check if title is generic
        const isGeneric = genericTitles.some(generic =>
            doc.title.toLowerCase() === generic.toLowerCase()
        );

        if (isGeneric) {
            // Create descriptive title: "Completion Report - Task Name"
            const newTitle = `${doc.title} - ${doc.task.title}`;

            await prisma.taskDocument.update({
                where: { id: doc.id },
                data: { title: newTitle }
            });

            console.log(`✅ Updated: "${doc.title}" → "${newTitle}"`);
            console.log(`   Task: ${doc.task.title} (Level ${doc.task.level})`);
            console.log('');
            fixed++;
        }
    }

    if (fixed === 0) {
        console.log('✅ No generic document titles found!');
    } else {
        console.log(`\n✅ Fixed ${fixed} generic document titles!`);
    }

    // Verify
    console.log('\n📊 Verification:');
    const updated = await prisma.taskDocument.findMany({
        select: { title: true }
    });

    const titleCounts = updated.reduce((acc, doc) => {
        acc[doc.title] = (acc[doc.title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const duplicates = Object.entries(titleCounts).filter(([_, count]) => count > 1);

    if (duplicates.length === 0) {
        console.log('✅ All document titles are now unique!');
    } else {
        console.log(`⚠️  Still have ${duplicates.length} duplicate titles`);
        for (const [title, count] of duplicates.slice(0, 5)) {
            console.log(`   - "${title}": ${count} instances`);
        }
    }

    await prisma.$disconnect();
}

fixGenericDocumentTitles().catch(console.error);
