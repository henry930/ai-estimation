'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectList from '@/components/dashboard/ProjectList';
import RepoSelection from '@/components/dashboard/RepoSelection';

export default function ProjectsPage() {
    const [showRepoSelection, setShowRepoSelection] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleProjectCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">All Projects</h1>
                    <p className="text-gray-400 mt-1">Manage and monitor all your estimation projects.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <ProjectList
                        key={refreshKey}
                        onConnectClick={() => setShowRepoSelection(true)}
                    />
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
