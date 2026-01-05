import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FREE_TIER_LIMIT } from '@/lib/subscription'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                subscriptions: {
                    where: { status: 'active' },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const subscription = user.subscriptions[0] || {
            plan: 'free',
            status: 'active',
        }

        // Calculate Usage
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const currentUsage = await prisma.estimation.count({
            where: {
                project: {
                    userId: user.id
                },
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });

        const limit = subscription.plan === 'pro' || subscription.plan === 'team'
            ? Infinity
            : FREE_TIER_LIMIT;

        return NextResponse.json({
            subscription: {
                ...subscription,
                usage: currentUsage,
                limit: limit === Infinity ? -1 : limit,
                planName: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
            }
        })
    } catch (error) {
        console.error('Get subscription error:', error)
        return NextResponse.json(
            { error: 'Failed to get subscription' },
            { status: 500 }
        )
    }
}
