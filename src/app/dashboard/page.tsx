'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectList from '@/components/dashboard/ProjectList';
import QuickActions from '@/components/dashboard/QuickActions';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';
import RepoSelection from '@/components/dashboard/RepoSelection';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [showRepoSelection, setShowRepoSelection] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleProjectCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}</h1>
                        <p className="text-gray-400 mt-1">Here&apos;s what&apos;s happening with your projects.</p>
                    </div>
                    <div className="text-sm text-gray-400">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area (Projects) - spans 2 cols */}
                    <div className="lg:col-span-2 space-y-8">
                        <ProjectList key={refreshKey} onConnectClick={() => setShowRepoSelection(true)} />
                    </div>

                    {/* Sidebar Area (Quick Actions & Stats) - spans 1 col */}
                    <div className="space-y-6">
                        <QuickActions onConnectGitHub={() => setShowRepoSelection(true)} />
                        <SubscriptionStatus />
                    </div>
                </div>
            </div>

            {showRepoSelection && (
                <RepoSelection
                    onProjectCreated={handleProjectCreated}
                    onClose={() => setShowRepoSelection(false)}
                />
            )}
        </DashboardLayout>
    );
}
