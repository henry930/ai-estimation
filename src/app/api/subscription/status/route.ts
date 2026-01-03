import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                subscriptions: {
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

        return NextResponse.json({ subscription })
    } catch (error) {
        console.error('Get subscription error:', error)
        return NextResponse.json(
            { error: 'Failed to get subscription' },
            { status: 500 }
        )
    }
}
