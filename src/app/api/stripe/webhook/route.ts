import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: Request) {
    // Check if Stripe is configured
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe is not configured' },
            { status: 503 }
        )
    }

    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.userId
                const plan = session.metadata?.plan

                if (userId && plan) {
                    await prisma.subscription.create({
                        data: {
                            userId,
                            plan,
                            status: 'active',
                            startDate: new Date(),
                            stripeCustomerId: session.customer as string,
                        },
                    })
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                await prisma.subscription.updateMany({
                    where: { stripeCustomerId: customerId },
                    data: {
                        status: subscription.status === 'active' ? 'active' : 'cancelled',
                    },
                })
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                await prisma.subscription.updateMany({
                    where: { stripeCustomerId: customerId },
                    data: {
                        status: 'cancelled',
                        endDate: new Date(),
                    },
                })
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}
