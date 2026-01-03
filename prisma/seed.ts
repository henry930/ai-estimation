import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create test users
    const user1 = await prisma.user.create({
        data: {
            email: 'demo@aiestimation.com',
            name: 'Demo User',
            passwordHash: 'hashed_password_here', // In real app, use bcrypt
        },
    })

    const user2 = await prisma.user.create({
        data: {
            email: 'test@aiestimation.com',
            name: 'Test User',
            passwordHash: 'hashed_password_here',
        },
    })

    console.log('✅ Created users:', user1.email, user2.email)

    // Create subscriptions
    const subscription1 = await prisma.subscription.create({
        data: {
            userId: user1.id,
            plan: 'pro',
            status: 'active',
            startDate: new Date(),
        },
    })

    const subscription2 = await prisma.subscription.create({
        data: {
            userId: user2.id,
            plan: 'free',
            status: 'active',
            startDate: new Date(),
        },
    })

    console.log('✅ Created subscriptions:', subscription1.plan, subscription2.plan)

    // Create sample projects
    const project1 = await prisma.project.create({
        data: {
            userId: user1.id,
            name: 'E-Commerce Platform',
            description: 'Full-stack e-commerce application with payment integration',
            githubUrl: 'https://github.com/example/ecommerce',
        },
    })

    const project2 = await prisma.project.create({
        data: {
            userId: user1.id,
            name: 'AI Estimation System',
            description: 'AI-powered project estimation with GitHub integration',
            githubUrl: 'https://github.com/henry930/ai-estimation',
        },
    })

    console.log('✅ Created projects:', project1.name, project2.name)

    // Create sample estimations
    const estimation1 = await prisma.estimation.create({
        data: {
            projectId: project1.id,
            tasks: JSON.stringify({
                phases: [
                    {
                        name: 'Frontend Development',
                        hours: 80,
                        tasks: ['Product Catalog', 'Shopping Cart', 'Checkout Flow'],
                    },
                    {
                        name: 'Backend API',
                        hours: 60,
                        tasks: ['Product API', 'Order Management', 'Payment Integration'],
                    },
                ],
            }),
            totalHours: 247,
            minHours: 200,
            maxHours: 290,
            status: 'confirmed',
        },
    })

    const estimation2 = await prisma.estimation.create({
        data: {
            projectId: project2.id,
            tasks: JSON.stringify({
                phases: [
                    {
                        name: 'Phase 1: Foundation',
                        hours: 40,
                        tasks: ['Next.js Setup', 'Database Schema', 'UI Components'],
                    },
                    {
                        name: 'Phase 2: Authentication',
                        hours: 48,
                        tasks: ['NextAuth Setup', 'Subscription Management'],
                    },
                ],
            }),
            totalHours: 312,
            minHours: 280,
            maxHours: 350,
            status: 'draft',
        },
    })

    console.log('✅ Created estimations:', estimation1.totalHours, estimation2.totalHours)

    // Create sample chat history
    const chat1 = await prisma.chatHistory.create({
        data: {
            projectId: project1.id,
            messages: JSON.stringify([
                { role: 'user', content: 'I need an e-commerce platform with payment integration' },
                { role: 'assistant', content: 'I can help estimate that project. What features do you need?' },
                { role: 'user', content: 'Product catalog, shopping cart, checkout, and Stripe payments' },
            ]),
            context: JSON.stringify({
                techStack: ['Next.js', 'PostgreSQL', 'Stripe'],
                requirements: ['Product management', 'Shopping cart', 'Payment processing'],
            }),
        },
    })

    console.log('✅ Created chat history')

    console.log('🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
