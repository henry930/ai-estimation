'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string | null;
    githubUrl: string | null;
    status: string;
    lastSync: string;
    createdAt: string;
    updatedAt: string;
}

interface ProjectListProps {
    onConnectClick: () => void;
}

export default function ProjectList({ onConnectClick }: ProjectListProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            if (!response.ok) throw new Error('Failed to fetch projects');
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSyncingId(projectId);

        try {
            const response = await fetch(`/api/projects/${projectId}/sync`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Sync failed');
            await fetchProjects();
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            setSyncingId(null);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Projects</h2>
                <Link href="/dashboard/projects" className="text-sm text-blue-400 hover:text-blue-300">
                    View all
                </Link>
            </div>

            <div className="flex flex-col gap-4">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all gap-4"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold group-hover:text-blue-400 transition-colors truncate">
                                    {project.name}
                                </h3>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap ${project.status === 'active'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    }`}>
                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-1">
                                {project.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-400 shrink-0">
                            <div className="flex items-center gap-2">
                                <GitHubIcon />
                                <span className="max-w-[150px] truncate">{project.githubUrl?.split('/').slice(-2).join('/')}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-[10px] text-gray-500">
                                    Synced {new Date(project.lastSync).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={(e) => handleSync(e, project.id)}
                                    disabled={syncingId === project.id}
                                    className={`text-xs flex items-center gap-1 hover:text-white transition-colors ${syncingId === project.id ? 'animate-pulse pointer-events-none' : ''}`}
                                >
                                    <SyncIcon />
                                    {syncingId === project.id ? 'Syncing...' : 'Sync'}
                                </button>
                            </div>
                            <div className="hidden md:block">
                                <ChevronRightIcon />
                            </div>
                        </div>
                    </Link>
                ))}

                <button
                    onClick={onConnectClick}
                    className="flex items-center justify-center p-6 rounded-2xl border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-gray-500 hover:text-white group gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlusIcon />
                    </div>
                    <span className="font-medium">Connect Repository</span>
                </button>
            </div>
        </div>
    );
}

function ChevronRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

function SyncIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    );
}
