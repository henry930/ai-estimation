import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { plan } = await request.json()

        if (!['pro', 'team'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const planConfig = STRIPE_PLANS[plan as 'pro' | 'team']

        if (!planConfig.priceId) {
            return NextResponse.json(
                { error: 'Price ID not configured' },
                { status: 500 }
            )
        }

        // Get or create Stripe customer
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { subscriptions: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        let customerId = user.subscriptions[0]?.stripeCustomerId

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: { userId: user.id },
            })
            customerId = customer.id
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: planConfig.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
            metadata: {
                userId: user.id,
                plan,
            },
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
