import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { subscriptions: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const activeSubscription = user.subscriptions.find(
            (sub) => sub.status === 'active'
        )

        if (!activeSubscription?.stripeCustomerId) {
            return NextResponse.json(
                { error: 'No active subscription' },
                { status: 400 }
            )
        }

        // Get Stripe subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
            customer: activeSubscription.stripeCustomerId,
            status: 'active',
        })

        if (subscriptions.data.length === 0) {
            return NextResponse.json(
                { error: 'No active Stripe subscription' },
                { status: 400 }
            )
        }

        // Cancel the subscription
        await stripe.subscriptions.cancel(subscriptions.data[0].id)

        // Update database
        await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
                status: 'cancelled',
                endDate: new Date(),
            },
        })

        return NextResponse.json({ message: 'Subscription cancelled' })
    } catch (error) {
        console.error('Cancel subscription error:', error)
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        )
    }
}
