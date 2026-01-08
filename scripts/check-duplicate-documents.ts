/**
 * Check for duplicate document titles (same title for same task)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicateDocuments() {
    console.log('🔍 Checking for duplicate document titles...\n');

    // Get all documents
    const documents = await prisma.taskDocument.findMany({
        select: {
            id: true,
            taskId: true,
            title: true,
            url: true,
            type: true,
            createdAt: true,
        },
        orderBy: [
            { taskId: 'asc' },
            { title: 'asc' },
            { createdAt: 'asc' }
        ]
    });

    console.log(`📊 Total documents: ${documents.length}\n`);

    // Group by taskId + title
    const grouped = documents.reduce((acc, doc) => {
        const key = `${doc.taskId}::${doc.title}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(doc);
        return acc;
    }, {} as Record<string, typeof documents>);

    // Find duplicates (same title for same task)
    const duplicates = Object.entries(grouped).filter(([_, docs]) => docs.length > 1);

    if (duplicates.length === 0) {
        console.log('✅ No duplicate document titles found!');
        console.log(`Total unique documents: ${Object.keys(grouped).length}`);
    } else {
        console.log(`❌ Found ${duplicates.length} duplicate document titles:\n`);

        for (const [key, docs] of duplicates) {
            const [taskId, title] = key.split('::');
            console.log(`📌 "${title}" on task ${taskId.substring(0, 8)}... (${docs.length} instances):`);
            for (const doc of docs) {
                console.log(`   - ID: ${doc.id.substring(0, 8)}... | Type: ${doc.type} | URL: ${doc.url.substring(0, 50)}...`);
            }
            console.log('');
        }

        console.log('\n⚠️  Recommendation: Rename or remove duplicate documents');
    }

    // Also check for documents with same title across different tasks
    const titleGroups = documents.reduce((acc, doc) => {
        if (!acc[doc.title]) {
            acc[doc.title] = [];
        }
        acc[doc.title].push(doc);
        return acc;
    }, {} as Record<string, typeof documents>);

    const commonTitles = Object.entries(titleGroups)
        .filter(([_, docs]) => docs.length > 3)
        .sort((a, b) => b[1].length - a[1].length);

    if (commonTitles.length > 0) {
        console.log('\n📋 Most common document titles (across all tasks):');
        for (const [title, docs] of commonTitles.slice(0, 10)) {
            console.log(`   - "${title}": ${docs.length} instances`);
        }
    }

    // Statistics
    console.log('\n📊 Document Statistics:');
    console.log(`Total documents: ${documents.length}`);
    console.log(`Unique (task + title): ${Object.keys(grouped).length}`);
    console.log(`Duplicates (same task): ${duplicates.length}`);
    console.log(`Unique titles (all tasks): ${Object.keys(titleGroups).length}`);

    await prisma.$disconnect();
}

checkDuplicateDocuments().catch(console.error);
