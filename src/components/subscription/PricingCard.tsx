'use client'

import { STRIPE_PLANS } from '@/lib/stripe'

interface PricingCardProps {
    plan: 'free' | 'pro' | 'team'
    currentPlan?: string
}

export function PricingCard({ plan, currentPlan }: PricingCardProps) {
    const planConfig = STRIPE_PLANS[plan]
    const isCurrent = currentPlan === plan

    const handleSubscribe = async () => {
        if (plan === 'free') return

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error('Checkout error:', error)
        }
    }

    return (
        <div
            className={`bg-white rounded-2xl shadow-lg p-8 ${plan === 'pro' ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
        >
            {plan === 'pro' && (
                <div className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                </div>
            )}

            <h3 className="text-2xl font-bold mb-2">{planConfig.name}</h3>
            <div className="mb-6">
                <span className="text-4xl font-bold">
                    ${(planConfig.price / 100).toFixed(0)}
                </span>
                {plan !== 'free' && <span className="text-gray-500">/month</span>}
            </div>

            <ul className="space-y-3 mb-8">
                {planConfig.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <svg
                            className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={handleSubscribe}
                disabled={isCurrent || plan === 'free'}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition ${isCurrent
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan === 'pro'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : plan === 'team'
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
            >
                {isCurrent ? 'Current Plan' : plan === 'free' ? 'Free Forever' : 'Subscribe'}
            </button>
        </div>
    )
}
