import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-hub-signature-256');
        const event = req.headers.get('x-github-event');

        if (!signature && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'No signature' }, { status: 401 });
        }

        if (process.env.GITHUB_WEBHOOK_SECRET && signature) {
            const verified = verifySignature(body, signature, process.env.GITHUB_WEBHOOK_SECRET);
            if (!verified) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const payload = JSON.parse(body);
        console.log(`📦 Received GitHub webhook event: ${event}`);

        if (event === 'issues') {
            await handleIssueEvent(payload);
        } else if (event === 'issue_comment') {
            await handleIssueCommentEvent(payload);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('❌ Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function verifySignature(body: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(body).digest('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch (e) {
        return false;
    }
}

async function handleIssueEvent(payload: any) {
    const { action, issue, repository } = payload;
    const repoId = repository.id.toString();
    const issueNumber = issue.number;

    console.log(`🔧 Processing issue ${action}: #${issueNumber} in repo ${repoId}`);

    // Find the project associated with this repo
    const project = await prisma.project.findFirst({
        where: { githubRepoId: repoId }
    });

    if (!project) {
        console.log('⚠️  Project not found for this repository');
        return;
    }

    // Find the task associated with this issue
    const task = await prisma.task.findFirst({
        where: {
            projectId: project.id,
            githubIssueNumber: issueNumber
        }
    });

    if (!task) {
        console.log(`⚠️  Task not found for issue #${issueNumber}`);
        return;
    }

    let newStatus = task.status;

    if (action === 'closed') {
        newStatus = 'DONE';
    } else if (action === 'reopened') {
        newStatus = 'IN_PROGRESS';
    } else if (action === 'opened') {
        newStatus = 'TODO';
    }

    if (newStatus !== task.status) {
        await prisma.task.update({
            where: { id: task.id },
            data: { status: newStatus }
        });
        console.log(`✅ Updated task "${task.title}" status to ${newStatus}`);
    }

    // AI Integration: If issue is closed, maybe generate a report?
    if (action === 'closed') {
        // Trigger generic AI report generation (placeholder)
        // await generateTaskCompletionReport(task.id);
    }
}

async function handleIssueCommentEvent(payload: any) {
    const { action, comment, issue, repository } = payload;

    if (action !== 'created') return;

    const repoId = repository.id.toString();
    const issueNumber = issue.number;

    const project = await prisma.project.findFirst({
        where: { githubRepoId: repoId }
    });

    if (!project) return;

    const task = await prisma.task.findFirst({
        where: {
            projectId: project.id,
            githubIssueNumber: issueNumber
        }
    });

    if (!task) return;

    // Create the comment in our database
    await prisma.taskComment.create({
        data: {
            taskId: task.id,
            githubCommentId: comment.id,
            author: comment.user.login,
            content: comment.body,
        }
    });

    console.log(`✅ Synced comment for task "${task.title}" from ${comment.user.login}`);
}
