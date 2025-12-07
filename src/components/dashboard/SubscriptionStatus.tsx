'use client';

export default function SubscriptionStatus() {
    // Mock data - replace with actual subscription hook later
    const subscription = {
        plan: 'Free',
        usage: 1,
        limit: 3,
        renewsAt: '2025-01-01',
    };

    const usagePercent = (subscription.usage / subscription.limit) * 100;

    return (
        <div className="bg-[#111] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Subscription</h3>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">
                    {subscription.plan} Plan
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Monthly Usage</span>
                        <span className="text-white font-medium">
                            {subscription.usage} / {subscription.limit} estimations
                        </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <p className="text-sm text-gray-500 mb-4">
                        Renews on {new Date(subscription.renewsAt).toLocaleDateString()}
                    </p>
                    <button className="w-full py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        </div>
    );
}
