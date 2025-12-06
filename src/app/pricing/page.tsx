import { PricingCard } from '@/components/subscription/PricingCard'

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600">
                        Start with our free plan or upgrade for unlimited estimations
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <PricingCard plan="free" />
                    <PricingCard plan="pro" />
                    <PricingCard plan="team" />
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-600 mb-4">
                        All plans include our AI-powered estimation engine
                    </p>
                    <div className="flex justify-center gap-8 text-sm text-gray-500">
                        <span>✓ Secure payments</span>
                        <span>✓ Cancel anytime</span>
                        <span>✓ 24/7 support</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
