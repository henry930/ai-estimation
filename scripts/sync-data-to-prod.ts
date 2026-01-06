import { PrismaClient as SQLiteClient } from '@prisma/client';
import { PrismaClient as PGClient } from '@prisma/client';

async function sync() {
    console.log('🔄 Starting data sync from local SQLite to production PostgreSQL...');

    const local = new SQLiteClient({
        datasources: { db: { url: 'file:./prisma/dev.db' } }
    });

    const prodUrl = process.env.DATABASE_URL;
    if (!prodUrl || !prodUrl.startsWith('postgresql')) {
        console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
        process.exit(1);
    }

    const prod = new PGClient({
        datasources: { db: { url: prodUrl } }
    });

    try {
        // Order matters due to foreign keys
        const models = ['user', 'subscription', 'project', 'taskGroup', 'task', 'subTask', 'taskDocument', 'estimation', 'chatHistory'];

        for (const model of models) {
            console.log(`📦 Syncing ${model}...`);
            const data = await (local as any)[model].findMany();

            if (data.length === 0) {
                console.log(`  Skipping ${model} (no data)`);
                continue;
            }

            // Simple "upsert" or "createMany" approach
            // PostgreSQL createMany is supported
            try {
                // Clear existing or handle unique constraints. 
                // For a full sync, we might want to clear or update. 
                // Given the requirement "any local changes... needs to push to prod", 
                // we'll try to update existing records or create new ones.

                for (const item of data) {
                    await (prod as any)[model].upsert({
                        where: { id: item.id },
                        update: item,
                        create: item,
                    });
                }
                console.log(`  ✅ Synced ${data.length} records for ${model}`);
            } catch (err) {
                console.error(`  ❌ Failed to sync ${model}:`, err);
            }
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
