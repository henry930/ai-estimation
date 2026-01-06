'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GitHubBranch } from '@/lib/github';
import Link from 'next/link';
import TaskBreakdownTable, { TaskCategory } from '@/components/dashboard/TaskBreakdownTable';
import ProjectAgentPanel from '@/components/dashboard/ProjectAgentPanel';
import { BotIcon, LayoutDashboardIcon, FileTextIcon, AlertCircleIcon, FileCodeIcon } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState<'implementation-plan' | 'tasks' | 'documents' | 'report' | 'agent'>('tasks');
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
            setError(null);

            // Fetch project first
            const projectRes = await fetch(`/api/projects/${params.id}`);
            if (!projectRes.ok) {
                throw new Error('Failed to fetch project');
            }
            const projectData = await projectRes.json();
            setProject(projectData);

            // Fetch branches in the background so it doesn't block the main UI
            fetch(`/api/projects/${params.id}/branches`)
                .then(r => r.ok ? r.json() : [])
                .then(data => setBranches(data))
                .catch(err => console.error('Background branch fetch failed:', err));

            // Fetch tasks (critical data)
            const tasksRes = await fetch(`/api/projects/${params.id}/tasks`);
            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                setTaskGroups(tasksData);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchClick = (branchName: string) => {
        setHighlightedBranch(branchName);
        setShowBranches(true);
        setActiveTab('tasks');
        // Scroll to branches section logic can remain if needed
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
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Link
                                    href="/dashboard"
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <BackIcon />
                                </Link>
                                <span className="text-sm text-gray-500 font-mono">Project</span>
                            </div>
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            <p className="text-gray-400 max-w-2xl mt-1">{project.description}</p>
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

                    {/* Project Statistics */}
                    {taskGroups.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                                <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Total Hours</div>
                                <div className="text-2xl font-bold text-white">
                                    {taskGroups.reduce((acc, g) => acc + (g.totalHours || g.tasks.reduce((sum, t) => sum + t.hours, 0)), 0)}h
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                                <div className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1">Progress</div>
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl font-bold text-white">
                                        {(() => {
                                            const totalHours = taskGroups.reduce((acc, g) => acc + (g.totalHours || g.tasks.reduce((sum, t) => sum + t.hours, 0)), 0);
                                            const completedHours = taskGroups.reduce((acc, g) => {
                                                return acc + g.tasks.filter(t => t.status === 'DONE').reduce((sum, t) => sum + t.hours, 0);
                                            }, 0);
                                            return totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;
                                        })()}%
                                    </div>
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(() => {
                                                    const totalHours = taskGroups.reduce((acc, g) => acc + (g.totalHours || g.tasks.reduce((sum, t) => sum + t.hours, 0)), 0);
                                                    const completedHours = taskGroups.reduce((acc, g) => {
                                                        return acc + g.tasks.filter(t => t.status === 'DONE').reduce((sum, t) => sum + t.hours, 0);
                                                    }, 0);
                                                    return totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;
                                                })()}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                                <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1">Task Groups</div>
                                <div className="text-2xl font-bold text-white">{taskGroups.length}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
                                <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider mb-1">Total Tasks</div>
                                <div className="text-2xl font-bold text-white">
                                    {taskGroups.reduce((acc, g) => acc + g.tasks.length, 0)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10">
                    <div className="flex gap-6">
                        {['implementation-plan', 'tasks', 'documents', 'report', 'agent'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === tab
                                    ? 'border-blue-500 text-blue-500'
                                    : 'border-transparent text-gray-500 hover:text-gray-300'
                                    } capitalize`}
                            >
                                {tab === 'agent' && <BotIcon className="w-4 h-4" />}
                                {tab === 'tasks' ? 'Task List' :
                                    tab === 'agent' ? 'AI Agent' :
                                        tab === 'report' ? 'Report' :
                                            tab === 'implementation-plan' ? 'Implementation Plan' :
                                                tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'implementation-plan' && (
                        <div className="space-y-4 animate-in fade-in duration-300 max-w-4xl">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2 text-white flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                            </svg>
                                            Implementation Plan
                                        </h3>
                                        <p className="text-sm text-gray-400">Comprehensive guide for implementing this project</p>
                                    </div>
                                    {project.githubUrl && (
                                        <a
                                            href={`${project.githubUrl.replace('.git', '')}/blob/main/docs/implementation-plans/project-${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                            View Full Plan on GitHub
                                        </a>
                                    )}
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <h4 className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-3">Project Overview</h4>
                                    <p className="text-gray-300 leading-relaxed mb-6">
                                        {project.description || 'This project aims to deliver a comprehensive solution that meets all requirements and provides value to users.'}
                                    </p>

                                    <h4 className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-3">Implementation Strategy</h4>
                                    <div className="space-y-3 mb-6">
                                        {taskGroups.map((group, index) => (
                                            <div key={group.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="font-medium text-white">Phase {index + 1}: {group.title}</h5>
                                                    <span className="text-xs text-gray-500">{group.tasks.length} tasks</span>
                                                </div>
                                                <p className="text-sm text-gray-400">{group.objective || group.description || 'Complete all tasks in this phase'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <h4 className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-3">Quick Links</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {project.githubUrl && (
                                            <>
                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                                    Repository
                                                </a>
                                                <a href={`${project.githubUrl.replace('.git', '')}/issues`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                                                    Issues
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-semibold mb-4">Project Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Created</span>
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Last Synced</span>
                                        <span>{new Date(project.updatedAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === 'documents' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Project Documentation</h3>

                                {/* Setup & Configuration */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Setup & Configuration</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { title: 'GitHub OAuth Setup', file: 'GITHUB_OAUTH_SETUP.md' },
                                            { title: 'GitHub OAuth (Simple)', file: 'github-oauth-setup-simple.md' },
                                            { title: 'GitHub OAuth (Production)', file: 'github-oauth-production-setup.md' },
                                            { title: 'Custom Domain Setup', file: 'custom-domain-setup.md' },
                                            { title: 'Production Setup Guide', file: 'production-setup-guide.md' },
                                        ].map(doc => {
                                            const githubUrl = project.githubUrl
                                                ? `${project.githubUrl.replace('.git', '')}/blob/main/docs/${doc.file}`
                                                : `#`;
                                            return (
                                                <a
                                                    key={doc.file}
                                                    href={githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group flex items-center gap-3"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-blue-400">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                    </svg>
                                                    <span className="font-medium text-gray-200 group-hover:text-white text-sm">{doc.title}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Architecture & Design */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Architecture & Design</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { title: 'Database Schema', file: 'database-schema-hierarchical.md' },
                                            { title: 'Hierarchical Structure', file: 'complete-hierarchical-structure.md' },
                                            { title: 'Dashboard UI Design', file: 'dashboard-ui-hierarchical.md' },
                                            { title: 'Git Branching Strategy', file: 'git-branching-strategy.md' },
                                        ].map(doc => {
                                            const githubUrl = project.githubUrl
                                                ? `${project.githubUrl.replace('.git', '')}/blob/main/docs/${doc.file}`
                                                : `#`;
                                            return (
                                                <a
                                                    key={doc.file}
                                                    href={githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group flex items-center gap-3"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-purple-400">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 15.3m14.8 0 .94.235a2.25 2.25 0 0 1-.94 4.015L12 21l-7.8-1.45a2.25 2.25 0 0 1-.94-4.015l.94-.235" />
                                                    </svg>
                                                    <span className="font-medium text-gray-200 group-hover:text-white text-sm">{doc.title}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Development Guides */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Development Guides</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { title: 'Development Procedures', file: 'standard-development-procedures.md' },
                                            { title: 'Task Management Workflow', file: 'task-management-workflow.md' },
                                            { title: 'Testing Guide', file: 'TESTING-GUIDE.md' },
                                        ].map(doc => {
                                            const githubUrl = project.githubUrl
                                                ? `${project.githubUrl.replace('.git', '')}/blob/main/docs/${doc.file}`
                                                : `#`;
                                            return (
                                                <a
                                                    key={doc.file}
                                                    href={githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-all group flex items-center gap-3"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-green-400">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                                    </svg>
                                                    <span className="font-medium text-gray-200 group-hover:text-white text-sm">{doc.title}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Implementation Status */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Implementation Status</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { title: 'Implementation Status', file: 'implementation-status.md' },
                                            { title: 'Merge History', file: 'merge-history.md' },
                                            { title: 'Active Branches', file: 'active-branches.md' },
                                        ].map(doc => {
                                            const githubUrl = project.githubUrl
                                                ? `${project.githubUrl.replace('.git', '')}/blob/main/docs/${doc.file}`
                                                : `#`;
                                            return (
                                                <a
                                                    key={doc.file}
                                                    href={githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group flex items-center gap-3"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-orange-400">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                                                    </svg>
                                                    <span className="font-medium text-gray-200 group-hover:text-white text-sm">{doc.title}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'report' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                    </svg>
                                    Project Report
                                </h3>

                                <div className="space-y-6">
                                    {/* Executive Summary */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2">Executive Summary</h4>
                                        <p className="text-gray-300 leading-relaxed">
                                            {project.name} is an AI-powered project estimation and management platform.
                                            The project consists of {taskGroups.length} major phases with a total of {taskGroups.reduce((acc, g) => acc + g.tasks.length, 0)} tasks,
                                            estimated at {taskGroups.reduce((acc, g) => acc + (g.totalHours || g.tasks.reduce((sum, t) => sum + t.hours, 0)), 0)} hours of development effort.
                                        </p>
                                    </div>

                                    {/* Progress Overview */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">Progress Overview</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <div className="text-xs text-gray-500 mb-1">Completed Tasks</div>
                                                <div className="text-2xl font-bold">
                                                    {taskGroups.reduce((acc, g) => acc + g.tasks.filter(t => t.status === 'DONE').length, 0)}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <div className="text-xs text-gray-500 mb-1">In Progress</div>
                                                <div className="text-2xl font-bold text-blue-400">
                                                    {taskGroups.reduce((acc, g) => acc + g.tasks.filter(t => t.status === 'IN PROGRESS').length, 0)}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <div className="text-xs text-gray-500 mb-1">Pending</div>
                                                <div className="text-2xl font-bold text-gray-400">
                                                    {taskGroups.reduce((acc, g) => acc + g.tasks.filter(t => t.status === 'PENDING').length, 0)}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <div className="text-xs text-gray-500 mb-1">Hours Completed</div>
                                                <div className="text-2xl font-bold text-green-400">
                                                    {taskGroups.reduce((acc, g) => acc + g.tasks.filter(t => t.status === 'DONE').reduce((sum, t) => sum + t.hours, 0), 0)}h
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phase Breakdown */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">Phase Breakdown</h4>
                                        <div className="space-y-3">
                                            {taskGroups.map((group, index) => {
                                                const completedTasks = group.tasks.filter(t => t.status === 'DONE').length;
                                                const totalTasks = group.tasks.length;
                                                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                                                return (
                                                    <div key={group.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-mono text-gray-500">Phase {index + 1}</span>
                                                                <span className="font-medium">{group.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-xs text-gray-500">{completedTasks}/{totalTasks} tasks</span>
                                                                <span className="text-xs font-mono text-gray-400">{group.totalHours || group.tasks.reduce((sum, t) => sum + t.hours, 0)}h</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-mono text-gray-500 w-12 text-right">{progress}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Key Achievements */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">Key Achievements</h4>
                                        <ul className="space-y-2 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400 mt-0.5">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                                </svg>
                                                <span>Implemented hierarchical task management system with task groups, tasks, and subtasks</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400 mt-0.5">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                                </svg>
                                                <span>Created table-based accordion UI for better task visualization</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400 mt-0.5">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                                </svg>
                                                <span>Integrated GitHub OAuth and repository synchronization</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400 mt-0.5">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                                </svg>
                                                <span>Deployed to AWS with custom domain and production database</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Next Steps */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">Next Steps</h4>
                                        <ul className="space-y-2 text-gray-300">
                                            {taskGroups
                                                .filter(g => g.status !== 'DONE')
                                                .slice(0, 5)
                                                .map((group, index) => (
                                                    <li key={group.id} className="flex items-start gap-2">
                                                        <span className="text-blue-400 font-mono text-sm mt-0.5">{index + 1}.</span>
                                                        <span>Complete {group.title} - {group.tasks.filter(t => t.status !== 'DONE').length} tasks remaining</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Tasks Table - Full Width */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center gap-3">
                                        <span>Task Breakdown</span>
                                        <span className="text-xs font-normal text-gray-500 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                                            {taskGroups.reduce((acc, c) => acc + c.tasks.length, 0)} tasks
                                        </span>
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => alert('Export feature coming soon')}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                        >
                                            Export
                                        </button>
                                        <button
                                            onClick={() => setShowBranches(!showBranches)}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                                        >
                                            {showBranches ? 'Hide' : 'Show'} Branches
                                        </button>
                                    </div>
                                </div>

                                <TaskBreakdownTable
                                    categories={taskGroups}
                                    onBranchClick={handleBranchClick}
                                    githubUrl={project.githubUrl || undefined}
                                />
                            </div>

                            {/* Branches Section - Full Width when visible */}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {branches.map((branch) => (
                                            <div
                                                key={branch.name}
                                                className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${highlightedBranch === branch.name
                                                    ? 'bg-blue-500/10 border-blue-500/50'
                                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <BranchIcon />
                                                        <span className={`text-sm font-medium truncate ${highlightedBranch === branch.name ? 'text-blue-400' : ''}`}>
                                                            {branch.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                        {branch.isDefault && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                Default
                                                            </span>
                                                        )}
                                                        {branch.isMerged && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                                Merged
                                                            </span>
                                                        )}
                                                        {branch.protected && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/20">
                                                                Protected
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {(branch.commitCount !== undefined) && (
                                                    <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
                                                        <span>Last Commit: {branch.commit.sha.substring(0, 7)}</span>
                                                        <span>Active</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Cards - Below table */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() => alert('PDF Exporting feature coming in Phase 5')}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 text-sm font-medium"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                        <FilePdfIcon />
                                    </div>
                                    <span>Export to PDF</span>
                                </button>
                                <button
                                    onClick={() => alert('Repository Initialization feature coming in Phase 5')}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 text-sm font-medium"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                        <InitializeIcon />
                                    </div>
                                    <span>Initialize Repo</span>
                                </button>
                                <button
                                    onClick={() => alert('Sync feature available')}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 text-sm font-medium"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </div>
                                    <span>Sync Tasks</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('agent')}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 text-sm font-medium"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <BotIcon className="w-5 h-5" />
                                    </div>
                                    <span>AI Assistant</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'agent' && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <ProjectAgentPanel
                                projectId={project.id}
                                projectName={project.name}
                            />
                        </div>
                    )}
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
