import Stripe from 'stripe'

// Make Stripe optional - only initialize if key is provided
// This allows deployment without Stripe configuration
const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey
    ? new Stripe(stripeKey, {
        apiVersion: '2025-11-17.clover',
        typescript: true,
    })
    : null;

export const STRIPE_PLANS = {
    free: {
        name: 'Free',
        price: 0,
        priceId: null,
        features: ['3 estimations per month', 'Basic support'],
        limits: { estimations: 3 },
    },
    pro: {
        name: 'Pro',
        price: 2900, // $29.00 in cents
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
            'Unlimited estimations',
            'GitHub integration',
            'Priority support',
            'Export to PDF',
        ],
        limits: { estimations: -1 }, // unlimited
    },
    team: {
        name: 'Team',
        price: 9900, // $99.00 in cents
        priceId: process.env.STRIPE_TEAM_PRICE_ID,
        features: [
            'Everything in Pro',
            'Multiple users',
            'Shared projects',
            'Team analytics',
            'Dedicated support',
        ],
        limits: { estimations: -1, users: 10 },
    },
}
