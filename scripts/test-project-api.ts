import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProjectAPI() {
    console.log('🔍 Testing Project API Data...\n');

    // Test 1: Check if projects exist
    const projects = await prisma.project.findMany({
        take: 5,
        select: {
            id: true,
            name: true,
            userId: true,
            githubUrl: true,
        },
    });

    console.log(`✅ Found ${projects.length} projects:`);
    projects.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (ID: ${p.id}, User: ${p.userId})`);
    });
    console.log('');

    // Test 2: Check task groups for first project
    if (projects.length > 0) {
        const projectId = projects[0].id;
        const taskGroups = await prisma.taskGroup.findMany({
            where: { projectId },
            include: {
                tasks: {
                    include: {
                        subtasks: true,
                        documents: true,
                    },
                },
                documents: true,
            },
        });

        console.log(`✅ Found ${taskGroups.length} task groups for project "${projects[0].name}":`);
        taskGroups.forEach((tg, i) => {
            console.log(`   ${i + 1}. ${tg.title} (${tg.tasks.length} tasks)`);
        });
        console.log('');
    }

    // Test 3: Check users
    const users = await prisma.user.findMany({
        take: 5,
        select: {
            id: true,
            email: true,
            name: true,
        },
    });

    console.log(`✅ Found ${users.length} users:`);
    users.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.name} (${u.email})`);
    });
    console.log('');

    // Test 4: Check sessions
    const sessions = await prisma.session.findMany({
        take: 5,
        select: {
            id: true,
            userId: true,
            expires: true,
        },
    });

    console.log(`✅ Found ${sessions.length} active sessions`);
    const now = new Date();
    const validSessions = sessions.filter(s => s.expires > now);
    console.log(`   ${validSessions.length} sessions are still valid`);
    console.log('');

    console.log('📋 Summary:');
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Active Sessions: ${validSessions.length}`);
    console.log('');

    if (validSessions.length === 0) {
        console.log('⚠️  WARNING: No valid sessions found!');
        console.log('   You need to log in to access the project pages.');
        console.log('   Visit http://localhost:3001 and sign in with GitHub.');
    }

    await prisma.$disconnect();
}

testProjectAPI().catch(console.error);
