'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ClockIcon,
    ChevronRightIcon,
    PlusIcon,
    LayoutIcon,
    CalendarIcon,
    FolderIcon
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    updatedAt: string;
    _count?: {
        taskGroups: number;
    };
}

export default function ProjectList({ onConnectClick }: { onConnectClick?: () => void }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/projects');
            const data = await res.json();
            if (data.success) {
                setProjects(data.data);
            } else {
                throw new Error(data.error || 'Failed to load projects');
            }
        } catch (err: any) {
            console.error('Failed to fetch projects:', err);
            setError(err.message || 'An error occurred while loading projects');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'in progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'draft': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-white/5 text-gray-500 border-white/10';
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchProjects}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <FolderIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">My Projects</h2>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/projects"
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        View all
                    </Link>
                    <button
                        onClick={onConnectClick}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Create New
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/10 transition-all duration-200"
                    >
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                            <div className={`w-2.5 h-2.5 rounded-full ${project.status.toLowerCase() === 'active' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                project.status.toLowerCase() === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                                    'bg-gray-500'
                                }`} />
                        </div>

                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                    {project.name}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono">
                                    {project.id.slice(0, 8)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5 font-light">
                                {project.description || 'No description provided'}
                            </p>
                        </div>

                        {/* Stats - Desktop Only */}
                        <div className="hidden lg:flex items-center gap-6 px-4">
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                <LayoutIcon className="w-3.5 h-3.5" />
                                <span>{project._count?.taskGroups || 0} Groups</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 w-32">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRightIcon className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
                        </div>
                    </Link>
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                        <FolderIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No projects found yet.</p>
                        <button
                            onClick={onConnectClick}
                            className="mt-4 text-blue-400 text-sm font-bold hover:text-blue-300 transition-colors"
                        >
                            Create your first project
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
