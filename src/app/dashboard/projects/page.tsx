'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
    FolderIcon,
    PlusIcon,
    ExternalLinkIcon,
    ClockIcon,
    GitBranchIcon
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string | null;
    githubUrl: string | null;
    status: string;
    updatedAt: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProjects(data);
                }
            } catch (err) {
                console.error('Failed to fetch projects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">My Projects</h1>
                        <p className="text-gray-400 text-sm mt-1">Connect and manage your GitHub repositories.</p>
                    </div>
                    <Link
                        href="/estimate/new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
                    >
                        <PlusIcon className="w-4 h-4" />
                        New Project
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <FolderIcon className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-white font-medium">No projects found</h3>
                        <p className="text-gray-500 text-sm mt-1 text-center max-w-xs">
                            Start by creating a new estimation to connect your first project.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/management?projectId=${project.id}`}
                                className="group flex items-center gap-6 p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
                                        <FolderIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                                {project.name}
                                            </h3>
                                            <div className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-tighter shrink-0">
                                                {project.status}
                                            </div>
                                        </div>
                                        {project.description && (
                                            <p className="text-sm text-gray-400 line-clamp-1 leading-relaxed">
                                                {project.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                                    <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    {project.githubUrl && (
                                        <div className="flex items-center gap-1.5 text-blue-400/60 text-[11px] font-mono">
                                            <GitBranchIcon className="w-3.5 h-3.5" />
                                            <span>{project.githubUrl.split('/').slice(-2).join('/')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <ExternalLinkIcon className="w-5 h-5 text-blue-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
