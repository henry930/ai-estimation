import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

const prisma = new PrismaClient();

async function migrate() {
    console.log('🔄 Starting migration to flat task structure...\n');

    // Use direct SQL for migration
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const db = new Database(dbPath);

    try {
        // Step 1: Create new tasks table structure
        console.log('📋 Step 1: Creating new task table structure...');

        db.exec(`
            -- Create temporary new tasks table
            CREATE TABLE IF NOT EXISTS tasks_new (
                id TEXT PRIMARY KEY,
                projectId TEXT NOT NULL,
                parentId TEXT,
                title TEXT NOT NULL,
                description TEXT,
                objective TEXT,
                hours INTEGER,
                status TEXT DEFAULT 'PENDING',
                branch TEXT,
                aiPrompt TEXT,
                githubIssueNumber INTEGER,
                "order" INTEGER DEFAULT 0,
                level INTEGER DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (parentId) REFERENCES tasks_new(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_tasks_new_projectId ON tasks_new(projectId);
            CREATE INDEX IF NOT EXISTS idx_tasks_new_parentId ON tasks_new(parentId);
        `);

        console.log('   ✅ New task table created\n');

        // Step 2: Migrate TaskGroups to parent tasks (level 0)
        console.log('📋 Step 2: Migrating task groups to parent tasks...');

        const taskGroups = db.prepare('SELECT * FROM task_groups ORDER BY "order"').all();
        console.log(`   Found ${taskGroups.length} task groups to migrate`);

        const insertParentTask = db.prepare(`
            INSERT INTO tasks_new (id, projectId, parentId, title, description, objective, hours, status, branch, githubIssueNumber, "order", level, createdAt, updatedAt)
            VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        for (const group of taskGroups as any[]) {
            insertParentTask.run(
                group.id,
                group.projectId,
                group.title,
                group.description,
                group.objective,
                group.totalHours,
                group.status || 'PENDING',
                group.branch,
                group.githubIssueNumber,
                group.order
            );
            console.log(`   ✅ Migrated: ${group.title}`);
        }

        console.log(`   ✅ ${taskGroups.length} task groups migrated to parent tasks\n`);

        // Step 3: Migrate Tasks to child tasks (level 1)
        console.log('📋 Step 3: Migrating tasks to child tasks...');

        const tasks = db.prepare('SELECT * FROM tasks ORDER BY "order"').all();
        console.log(`   Found ${tasks.length} tasks to migrate`);

        const insertChildTask = db.prepare(`
            INSERT INTO tasks_new (id, projectId, parentId, title, description, objective, hours, status, branch, aiPrompt, githubIssueNumber, "order", level, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `);

        for (const task of tasks as any[]) {
            insertChildTask.run(
                task.id,
                (taskGroups as any[]).find(g => g.id === task.groupId)?.projectId || task.groupId,
                task.groupId, // parentId is the old groupId
                task.title,
                task.description,
                task.objective,
                task.hours,
                task.status,
                task.branch,
                task.aiPrompt,
                task.githubIssueNumber,
                task.order,
                task.createdAt,
                task.updatedAt
            );
        }

        console.log(`   ✅ ${tasks.length} tasks migrated to child tasks\n`);

        // Step 4: Migrate SubTasks to grandchild tasks (level 2)
        console.log('📋 Step 4: Migrating subtasks to grandchild tasks...');

        const subtasks = db.prepare('SELECT * FROM sub_tasks ORDER BY "order"').all();
        console.log(`   Found ${subtasks.length} subtasks to migrate`);

        const insertGrandchildTask = db.prepare(`
            INSERT INTO tasks_new (id, projectId, parentId, title, hours, status, githubIssueNumber, "order", level, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, ?, ?)
        `);

        for (const subtask of subtasks as any[]) {
            const parentTask = (tasks as any[]).find(t => t.id === subtask.taskId);
            if (parentTask) {
                const projectId = (taskGroups as any[]).find(g => g.id === parentTask.groupId)?.projectId;
                insertGrandchildTask.run(
                    subtask.id,
                    projectId,
                    subtask.taskId, // parentId is the old taskId
                    subtask.title,
                    subtask.hours || 1,
                    subtask.isCompleted ? 'DONE' : 'PENDING',
                    subtask.githubIssueNumber,
                    subtask.order,
                    subtask.createdAt,
                    subtask.updatedAt
                );
            }
        }

        console.log(`   ✅ ${subtasks.length} subtasks migrated to grandchild tasks\n`);

        // Step 5: Update task_documents to remove groupId
        console.log('📋 Step 5: Migrating task documents...');

        db.exec(`
            -- Create new task_documents table
            CREATE TABLE IF NOT EXISTS task_documents_new (
                id TEXT PRIMARY KEY,
                taskId TEXT NOT NULL,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                type TEXT DEFAULT 'markdown',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (taskId) REFERENCES tasks_new(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_task_documents_new_taskId ON task_documents_new(taskId);

            -- Copy task-level documents
            INSERT INTO task_documents_new (id, taskId, title, url, type, createdAt, updatedAt)
            SELECT id, taskId, title, url, type, createdAt, updatedAt
            FROM task_documents
            WHERE taskId IS NOT NULL;

            -- Copy group-level documents to parent tasks
            INSERT INTO task_documents_new (id, taskId, title, url, type, createdAt, updatedAt)
            SELECT id, groupId, title, url, type, createdAt, updatedAt
            FROM task_documents
            WHERE groupId IS NOT NULL;
        `);

        console.log('   ✅ Task documents migrated\n');

        // Step 6: Replace old tables with new ones
        console.log('📋 Step 6: Replacing old tables...');

        db.exec(`
            -- Drop old tables
            DROP TABLE IF EXISTS sub_tasks;
            DROP TABLE IF EXISTS task_documents;
            DROP TABLE IF EXISTS tasks;
            DROP TABLE IF EXISTS task_groups;

            -- Rename new tables
            ALTER TABLE tasks_new RENAME TO tasks;
            ALTER TABLE task_documents_new RENAME TO task_documents;
        `);

        console.log('   ✅ Tables replaced\n');

        // Step 7: Update projects table
        console.log('📋 Step 7: Updating projects table...');

        // Projects table should already be correct, just verify
        const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
        console.log(`   ✅ ${projectCount.count} projects verified\n`);

        console.log('✅ Migration completed successfully!\n');

        // Print summary
        const newTaskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as any;
        const level0Count = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE level = 0').get() as any;
        const level1Count = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE level = 1').get() as any;
        const level2Count = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE level = 2').get() as any;

        console.log('📊 Migration Summary:');
        console.log(`   Total tasks: ${newTaskCount.count}`);
        console.log(`   Level 0 (parent): ${level0Count.count}`);
        console.log(`   Level 1 (child): ${level1Count.count}`);
        console.log(`   Level 2 (grandchild): ${level2Count.count}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        db.close();
    }
}

migrate()
    .then(() => {
        console.log('\n✅ Done! Please run: npx prisma generate');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
