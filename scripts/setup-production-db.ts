#!/usr/bin/env tsx

/**
 * Production Database Setup Script
 * 
 * This script initializes the production PostgreSQL database by:
 * 1. Testing the database connection
 * 2. Running all pending Prisma migrations
 * 3. Verifying the schema is correctly applied
 * 4. Generating a report of the database state
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const PRODUCTION_DB_URL = process.env.DATABASE_URL ||
    "postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require";

async function testConnection() {
    console.log('🔍 Testing production database connection...\n');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: PRODUCTION_DB_URL,
            },
        },
    });

    try {
        await prisma.$connect();
        const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
        console.log('✅ Database connection successful!');
        console.log(`📊 PostgreSQL Version: ${result[0].version}\n`);
        await prisma.$disconnect();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        await prisma.$disconnect();
        return false;
    }
}

async function checkExistingTables() {
    console.log('🔍 Checking existing tables in production database...\n');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: PRODUCTION_DB_URL,
            },
        },
    });

    try {
        await prisma.$connect();
        const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

        if (tables.length === 0) {
            console.log('📝 No tables found. Database is empty and ready for migration.\n');
        } else {
            console.log(`📊 Found ${tables.length} existing tables:`);
            tables.forEach(t => console.log(`   - ${t.tablename}`));
            console.log('');
        }

        await prisma.$disconnect();
        return tables;
    } catch (error) {
        console.error('❌ Error checking tables:', error);
        await prisma.$disconnect();
        return [];
    }
}

async function runMigrations() {
    console.log('🚀 Running Prisma migrations on production database...\n');

    try {
        // Note: We need to temporarily update the schema to use postgresql
        console.log('⚠️  Note: Ensure schema.prisma is configured for PostgreSQL before running migrations\n');

        const output = execSync('npx prisma migrate deploy', {
            env: {
                ...process.env,
                DATABASE_URL: PRODUCTION_DB_URL,
            },
            encoding: 'utf-8',
        });

        console.log(output);
        console.log('✅ Migrations completed successfully!\n');
        return true;
    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
        return false;
    }
}

async function verifySchema() {
    console.log('🔍 Verifying database schema...\n');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: PRODUCTION_DB_URL,
            },
        },
    });

    try {
        await prisma.$connect();

        // Check critical tables exist
        const criticalTables = ['users', 'projects', 'tasks', 'task_groups'];
        const results = [];

        for (const table of criticalTables) {
            try {
                const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
                results.push({ table, status: '✅', count: (count as any)[0].count });
            } catch (error) {
                results.push({ table, status: '❌', error: 'Table not found' });
            }
        }

        console.log('📊 Schema Verification Results:');
        results.forEach(r => {
            if (r.status === '✅') {
                console.log(`   ${r.status} ${r.table}: ${r.count} records`);
            } else {
                console.log(`   ${r.status} ${r.table}: ${(r as any).error}`);
            }
        });
        console.log('');

        await prisma.$disconnect();
        return results.every(r => r.status === '✅');
    } catch (error) {
        console.error('❌ Schema verification failed:', error);
        await prisma.$disconnect();
        return false;
    }
}

async function generateReport() {
    console.log('📋 Generating Production Database Report...\n');
    console.log('='.repeat(60));
    console.log('PRODUCTION DATABASE SETUP REPORT');
    console.log('='.repeat(60));
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Database: ai_estimation`);
    console.log(`Host: ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com`);
    console.log('='.repeat(60));
    console.log('');
}

async function main() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Production Database Initialization Script              ║');
    console.log('║     AI Estimation Platform                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');

    await generateReport();

    // Step 1: Test connection
    const connected = await testConnection();
    if (!connected) {
        console.error('❌ Cannot proceed without database connection. Exiting...\n');
        process.exit(1);
    }

    // Step 2: Check existing tables
    await checkExistingTables();

    // Step 3: Ask for confirmation
    console.log('⚠️  WARNING: This will run migrations on the PRODUCTION database!');
    console.log('⚠️  Make sure you have:');
    console.log('   1. Updated schema.prisma to use PostgreSQL provider');
    console.log('   2. Backed up any existing data (if applicable)');
    console.log('   3. Reviewed all pending migrations\n');

    // For now, we'll skip auto-running migrations and just provide instructions
    console.log('📝 To run migrations manually, execute:');
    console.log('   DATABASE_URL="<production-url>" npx prisma migrate deploy\n');

    // Step 4: Verify schema (if migrations were run)
    console.log('📝 After running migrations, verify with:');
    console.log('   npx tsx scripts/setup-production-db.ts --verify-only\n');

    console.log('✅ Database setup script completed!\n');
}

// Run if --verify-only flag is passed
if (process.argv.includes('--verify-only')) {
    (async () => {
        await testConnection();
        await checkExistingTables();
        await verifySchema();
    })();
} else {
    main().catch(console.error);
}
