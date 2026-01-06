
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();

async function clearProduction() {
    console.log('\n🧹 Clearing production database for clean migration...');

    // Ordered to respect foreign keys (children first)
    const tables = [
        'chatHistory',
        'estimation',
        'taskDocument',
        'subTask',
        'task',
        'taskGroup',
        'project',
        'session',
        'account',
        'subscription',
        'user',
        'verificationToken'
    ];

    for (const model of tables) {
        try {
            const count = await (prisma as any)[model].count();
            if (count > 0) {
                console.log(`- Clearing ${count} records from ${model}...`);
                await (prisma as any)[model].deleteMany({});
            }
        } catch (e: any) {
            console.error(`❌ Error clearing ${model}:`, e.message);
        }
    }
}

export async function migrateTable(tableName: string, modelName: string) {
    console.log(`\n📦 Migrating table: ${tableName} to model: ${modelName}...`);

    try {
        const sqlitePath = path.join(process.cwd(), 'prisma', 'dev.db');
        const command = `sqlite3 "${sqlitePath}" ".mode json" "SELECT * FROM ${tableName}"`;
        let output = '';
        try {
            output = execSync(command).toString();
        } catch (e) {
            console.log(`ℹ️ Table ${tableName} does not exist or error reading it.`);
            return;
        }

        if (!output || output.trim() === '') {
            console.log(`ℹ️ Table ${tableName} is empty.`);
            return;
        }

        const data = JSON.parse(output);
        console.log(`📊 Found ${data.length} records in ${tableName}.`);

        const cleanedData = data.map((item: any) => {
            const newItem = { ...item };

            for (const key in newItem) {
                if (key.endsWith('At') || key === 'emailVerified' || key === 'expires' || key === 'lastSync' || key === 'startDate' || key === 'endDate') {
                    if (newItem[key] !== null && newItem[key] !== undefined) {
                        newItem[key] = new Date(newItem[key]);
                        if (isNaN(newItem[key].getTime())) {
                            newItem[key] = null;
                        }
                    }
                }

                if (key === 'isCompleted') {
                    newItem[key] = newItem[key] === 1;
                }
            }
            return newItem;
        });

        console.log(`🚀 Migrating into ${modelName}...`);

        let successCount = 0;
        let failCount = 0;
        for (const item of cleanedData) {
            try {
                await (prisma as any)[modelName].create({
                    data: item,
                });
                successCount++;
            } catch (err: any) {
                failCount++;
                if (failCount < 5) {
                    console.error(`❌ Error migrating into ${modelName} (${item.id || 'N/A'}):`, err.message);
                }
            }
        }
        console.log(`✅ Result: ${successCount} success, ${failCount} failed.`);
    } catch (error: any) {
        console.error(`❌ Global error migrating ${tableName}:`, error.message);
    }
}

async function main() {
    const envDatabaseUrl = process.env.DATABASE_URL;
    if (!envDatabaseUrl || !envDatabaseUrl.startsWith('postgresql://')) {
        console.error('❌ Error: DATABASE_URL must be a production PostgreSQL URL.');
        process.exit(1);
    }

    console.log('🏁 Starting FULL data transfer from SQLite to Production PostgreSQL...');

    await clearProduction();

    // Migration order matters for foreign keys! (Parents first)
    await migrateTable('users', 'user');
    await migrateTable('accounts', 'account');
    await migrateTable('sessions', 'session');
    await migrateTable('verification_tokens', 'verificationToken');
    await migrateTable('subscriptions', 'subscription');
    await migrateTable('projects', 'project');
    await migrateTable('task_groups', 'taskGroup');
    await migrateTable('tasks', 'task');
    await migrateTable('sub_tasks', 'subTask');
    await migrateTable('task_documents', 'taskDocument');
    await migrateTable('estimations', 'estimation');
    await migrateTable('chat_history', 'chatHistory');

    console.log('\n🎉 FULL Data migration complete!');
}

if (require.main === module) {
    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
