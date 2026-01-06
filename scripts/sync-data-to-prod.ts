import { PrismaClient as SQLiteClient } from '../prisma/generated/sqlite';
import { PrismaClient as PGClient } from '../prisma/generated/pg';
import path from 'path';

async function sync() {
    console.log('🔄 Starting data sync from local SQLite to production PostgreSQL...');

    const localDbPath = path.resolve(process.cwd(), 'prisma/dev.db');
    console.log(`📍 Local DB path: ${localDbPath}`);

    // Load local client (SQLite)
    const local = new SQLiteClient({
        datasources: { db: { url: `file:${localDbPath}` } }
    });

    // Load production client (PostgreSQL from environment)
    const prodUrl = process.env.DATABASE_URL || "postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require";

    if (!prodUrl || !prodUrl.startsWith('postgresql')) {
        console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
        process.exit(1);
    }

    const prod = new PGClient({
        datasources: { db: { url: prodUrl } }
    });

    try {
        // Order matters due to foreign keys
        // user -> account
        // user -> subscription
        // user -> project
        // project -> task (and parent tasks must exist before children)
        // task -> taskDocument
        const models = ['user', 'account', 'subscription', 'project', 'task', 'taskDocument', 'estimation', 'chatHistory'];

        for (const model of models) {
            console.log(`📦 Syncing ${model}...`);
            const data = await (local as any)[model].findMany();

            if (data.length === 0) {
                console.log(`  Skipping ${model} (no data)`);
                continue;
            }

            console.log(`  Found ${data.length} records in local. Upserting to production...`);

            if (model === 'task') {
                // For tasks, we need to sort by level to ensure parents are created before children
                data.sort((a: any, b: any) => (a.level || 0) - (b.level || 0));
            }

            for (const item of data) {
                try {
                    await (prod as any)[model].upsert({
                        where: { id: item.id },
                        update: item,
                        create: item,
                    });
                } catch (err: any) {
                    console.error(`  ⚠️ Failed to upsert ${model} ID ${item.id}:`, err.message);
                }
            }
            console.log(`  ✅ Synced ${model}`);
        }

        console.log('🎉 Data sync completed successfully!');
    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        await local.$disconnect();
        await prod.$disconnect();
    }
}

sync();
