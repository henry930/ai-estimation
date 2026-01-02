import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SubscriptionData {
    plan: string;
    usage: number;
    limit: number;
    renewsAt?: string;
    planName: string;
}

export default function SubscriptionStatus() {
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/subscription/status');
                if (!res.ok) throw new Error('Failed to fetch subscription status');
                const data = await res.json();
                setSubscription(data.subscription);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    if (loading) {
        return (
            <div className="bg-[#111] rounded-2xl p-6 border border-white/10 animate-pulse">
                <div className="h-6 w-32 bg-white/5 rounded mb-6" />
                <div className="space-y-4">
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-2 w-full bg-white/5 rounded" />
                </div>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="bg-[#111] rounded-2xl p-6 border border-white/10">
                <p className="text-red-400 text-sm">Failed to load subscription status.</p>
            </div>
        );
    }

    const usagePercent = subscription.limit > 0
        ? Math.min((subscription.usage / subscription.limit) * 100, 100)
        : 0;

    return (
        <div className="bg-[#111] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Subscription</h3>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">
                    {subscription.planName} Plan
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Monthly Usage</span>
                        <span className="text-white font-medium">
                            {subscription.usage} / {subscription.limit === -1 ? '∞' : subscription.limit} estimations
                        </span>
                    </div>
                    {subscription.limit !== -1 && (
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-white/5">
                    {subscription.renewsAt && (
                        <p className="text-sm text-gray-500 mb-4">
                            Renews on {new Date(subscription.renewsAt).toLocaleDateString()}
                        </p>
                    )}
                    {subscription.plan === 'free' && (
                        <Link
                            href="/pricing"
                            className="block w-full py-2 bg-white text-black rounded-lg text-sm text-center font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Upgrade to Pro
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
