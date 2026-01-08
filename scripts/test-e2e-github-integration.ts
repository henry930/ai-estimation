import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/github';
// Ensure this matches your .env or the value you want to test with. 
// If .env is not readable by this script directly verify in runtime.
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'test_secret';

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendWebhook(event: string, payload: any) {
    const body = JSON.stringify(payload);
    const signature = 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');

    const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-github-event': event,
            'x-hub-signature-256': signature
        },
        body
    });

    return res;
}

async function runE2ETest() {
    console.log('🧪 Starting E2E GitHub Integration Test...');
    console.log('----------------------------------------');

    // 1. Setup Data
    const repoId = '999999999'; // Test Repo ID
    const issueNumber = 8888;

    // Create Test User
    const user = await prisma.user.create({
        data: { email: `test-e2e-${Date.now()}@example.com` }
    });

    // Create Test Project
    const project = await prisma.project.create({
        data: {
            name: 'E2E Test Project',
            userId: user.id,
            githubRepoId: repoId
        }
    });

    // Create Test Task
    const task = await prisma.task.create({
        data: {
            title: 'Test Integration Task',
            projectId: project.id,
            githubIssueNumber: issueNumber,
            status: 'PENDING'
        }
    });

    console.log(`✅ Setup: Created Project (${project.id}) and Task (${task.id})`);

    try {
        // 2. Test: Update Status to IN_PROGRESS (Reopened)
        console.log('\n🔄 Scenario 1: Issue Reopened -> Task IN_PROGRESS');
        await sendWebhook('issues', {
            action: 'reopened',
            issue: { number: issueNumber },
            repository: { id: parseInt(repoId) }
        });

        await delay(1000); // Wait for async processing

        const taskStep2 = await prisma.task.findUnique({ where: { id: task.id } });
        if (taskStep2?.status === 'IN_PROGRESS') {
            console.log('✅ PASS: Task status updated to IN_PROGRESS');
        } else {
            console.error(`❌ FAIL: Task status is ${taskStep2?.status}, expected IN_PROGRESS`);
        }

        // 3. Test: Sync Comment
        console.log('\n💬 Scenario 2: New Comment -> Comment in DB');
        const commentId = 77777;
        const commentBody = 'Automated E2E Test Comment';

        await sendWebhook('issue_comment', {
            action: 'created',
            issue: { number: issueNumber },
            repository: { id: parseInt(repoId) },
            comment: {
                id: commentId,
                user: { login: 'test-bot' },
                body: commentBody
            }
        });

        await delay(1000);

        // @ts-ignore
        const comments = await prisma.taskComment.findMany({
            where: { taskId: task.id }
        });

        if (comments.length > 0 && comments[0].content === commentBody) {
            console.log('✅ PASS: Comment synced to database');
        } else {
            console.error('❌ FAIL: Comment not found in database');
        }

        // 4. Test: Close Issue -> Task DONE
        console.log('\n✅ Scenario 3: Issue Closed -> Task DONE');
        await sendWebhook('issues', {
            action: 'closed',
            issue: { number: issueNumber },
            repository: { id: parseInt(repoId) }
        });

        await delay(1000);

        const taskStep4 = await prisma.task.findUnique({ where: { id: task.id } });
        if (taskStep4?.status === 'DONE') {
            console.log('✅ PASS: Task status updated to DONE');
        } else {
            console.error(`❌ FAIL: Task status is ${taskStep4?.status}, expected DONE`);
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error);
    } finally {
        // 5. Cleanup
        console.log('\n🧹 Cleaning up test data...');
        // @ts-ignore
        await prisma.taskComment.deleteMany({ where: { taskId: task.id } });
        await prisma.task.delete({ where: { id: task.id } });
        await prisma.project.delete({ where: { id: project.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log('✅ Cleanup complete');
    }
}

runE2ETest().catch(console.error).finally(() => prisma.$disconnect());
