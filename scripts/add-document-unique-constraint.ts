/**
 * Add unique constraint to task_documents table
 * Prevents duplicate document titles for the same task
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addUniqueConstraint() {
    console.log('🔧 Adding unique constraint to task_documents...\n');

    try {
        // Add unique constraint using raw SQL
        await prisma.$executeRaw`
            ALTER TABLE task_documents 
            ADD CONSTRAINT task_documents_taskId_title_key 
            UNIQUE ("taskId", title);
        `;

        console.log('✅ Unique constraint added successfully!');
        console.log('   Constraint: task_documents_taskId_title_key');
        console.log('   Columns: (taskId, title)');
        console.log('\n📌 This prevents duplicate document titles for the same task.');

    } catch (error: any) {
        if (error.code === '23505' || error.message.includes('already exists')) {
            console.log('✅ Constraint already exists!');
        } else {
            console.error('❌ Error adding constraint:', error.message);
            throw error;
        }
    } finally {
        await prisma.$disconnect();
    }
}

addUniqueConstraint().catch(console.error);
