'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GitHubBranch } from '@/lib/github';
import Link from 'next/link';
import TaskBreakdown, { TaskCategory } from '@/components/dashboard/TaskBreakdown';

interface Project {
    id: string;
    name: string;
    description: string | null;
    githubUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function ProjectDetailsPage() {
    const params = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [branches, setBranches] = useState<GitHubBranch[]>([]);
    const [taskGroups, setTaskGroups] = useState<TaskCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBranches, setShowBranches] = useState(false);
    const [highlightedBranch, setHighlightedBranch] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchProjectData();
        }
    }, [params.id]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const [projectRes, branchesRes, tasksRes] = await Promise.all([
                fetch(`/api/projects/${params.id}`),
                fetch(`/api/projects/${params.id}/branches`),
                fetch(`/api/projects/${params.id}/tasks`)
            ]);

            if (!projectRes.ok) throw new Error('Failed to fetch project');
            if (!branchesRes.ok) throw new Error('Failed to fetch branches');
            if (!tasksRes.ok) throw new Error('Failed to fetch tasks');

            const [projectData, branchesData, tasksData] = await Promise.all([
                projectRes.json(),
                branchesRes.json(),
                tasksRes.json()
            ]);

            setProject(projectData);
            setBranches(branchesData);
            setTaskGroups(tasksData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchClick = (branchName: string) => {
        setHighlightedBranch(branchName);
        setShowBranches(true);
        // Scroll to branches section
        setTimeout(() => {
            document.getElementById('branches-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !project) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-red-400">Error</h2>
                    <p className="text-gray-400 mt-2">{error || 'Project not found'}</p>
                    <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mt-6 inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
                                <BackIcon />
                            </Link>
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                        </div>
                        <p className="text-gray-400 max-w-2xl">{project.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={project.githubUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center gap-2"
                        >
                            <GitHubIcon />
                            View on GitHub
                        </a>
                        <Link
                            href={`/estimate/new?projectId=${project.id}`}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all text-sm font-medium"
                        >
                            New Estimation
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tasks Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                            <h2 className="text-xl font-semibold mb-8 flex items-center justify-between">
                                Estimation Tasks
                                <span className="text-xs font-normal text-gray-500 px-2 py-1 rounded bg-white/5">
                                    {taskGroups.reduce((acc, c) => acc + c.tasks.length, 0)} total
                                </span>
                            </h2>

                            <TaskBreakdown
                                categories={taskGroups}
                                onBranchClick={handleBranchClick}
                            />
                        </div>
                    </div>

                    {/* Sidebar Side */}
                    <div className="space-y-6">
                        {/* Actions Button Card */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Project Actions</h2>
                            <button
                                onClick={() => alert('PDF Exporting feature coming in Phase 5')}
                                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 text-sm font-medium"
                            >
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                    <FilePdfIcon />
                                </div>
                                Export to PDF
                            </button>
                            <button
                                onClick={() => alert('Repository Initialization feature coming in Phase 5')}
                                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 text-sm font-medium"
                            >
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                    <InitializeIcon />
                                </div>
                                Initialize Repository
                            </button>
                        </div>
                        {/* Branches Section - Visible only when requested */}
                        {showBranches && (
                            <div id="branches-section" className="p-6 rounded-2xl bg-white/5 border border-blue-500/30 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Repository Branches</h2>
                                    <button
                                        onClick={() => setShowBranches(false)}
                                        className="text-gray-500 hover:text-white transition-colors text-xs"
                                    >
                                        Hide
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {branches.map((branch) => (
                                        <div
                                            key={branch.name}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${highlightedBranch === branch.name
                                                ? 'bg-blue-500/10 border-blue-500/50'
                                                : 'bg-white/5 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <BranchIcon />
                                                <span className={`text-sm font-medium truncate ${highlightedBranch === branch.name ? 'text-blue-400' : ''
                                                    }`}>
                                                    {branch.name}
                                                </span>
                                            </div>
                                            {branch.protected && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/20">
                                                    Protected
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats Placeholder */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h2 className="text-xl font-semibold mb-4">Project Stats</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Connected</span>
                                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Last Synced</span>
                                    <span>{new Date(project.updatedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function BackIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" />
        </svg>
    );
}

function BranchIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
    );
}

function FilePdfIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    )
}

function InitializeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    )
}
