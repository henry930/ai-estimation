'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    CircleIcon,
    ClockIcon,
    PlayIcon,
    GitBranchIcon,
    MessageSquareIcon,
    AlertCircleIcon,
    ChevronRightIcon,
    PlusIcon
} from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string | null;
    hours: number | null;
    status: string;
    branch: string | null;
    aiPrompt: string | null;
    issues: string | null;
}

interface TaskGroup {
    id: string;
    title: string;
    tasks: Task[];
}

export default function ManagementDashboard() {
    const [groups, setGroups] = useState<TaskGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/admin/tasks');
            const data = await res.json();
            if (data.success) {
                setGroups(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        setUpdatingId(taskId);
        try {
            const res = await fetch(`/api/admin/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchGroups(); // Refresh data
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'DONE':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'WAITING FOR REVIEW':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'IN PROGRESS':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default:
                return 'bg-white/5 text-gray-500 border-white/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DONE':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'WAITING FOR REVIEW':
                return <ClockIcon className="w-4 h-4" />;
            case 'IN PROGRESS':
                return <PlayIcon className="w-4 h-4" />;
            default:
                return <CircleIcon className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Project Management</h1>
                <p className="text-gray-400 text-sm max-w-2xl">
                    Track the lifecycle of your AI Estimation System. Manage task activation, review pull requests, and monitor branching strategy.
                </p>
            </div>

            {/* Task Groups */}
            <div className="space-y-16">
                {groups.map((group) => (
                    <div key={group.id} className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                                <ChevronRightIcon className="w-5 h-5 text-blue-500" />
                                {group.title}
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">
                                    {group.tasks.length} Tasks
                                </span>
                            </h2>
                        </div>

                        <div className="grid gap-4">
                            {group.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`relative group rounded-2xl bg-[#0a0a0a] border border-white/5 p-6 hover:bg-white/[0.02] transition-all duration-300 ${updatingId === task.id ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 transition-colors ${getStatusStyles(task.status)}`}>
                                                    {getStatusIcon(task.status)}
                                                    {task.status}
                                                </div>
                                                <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors">
                                                    {task.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-500 leading-relaxed max-w-3xl">
                                                {task.description}
                                            </p>

                                            {/* Meta Info */}
                                            <div className="flex items-center gap-6 pt-2">
                                                {task.branch && (
                                                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-400/70">
                                                        <GitBranchIcon className="w-3 h-3" />
                                                        {task.branch}
                                                    </div>
                                                )}
                                                {task.hours && (
                                                    <div className="text-[11px] text-gray-600 font-medium">
                                                        Estimated: {task.hours}h
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            {task.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleStatusChange(task.id, 'IN PROGRESS')}
                                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                                >
                                                    <PlayIcon className="w-3.5 h-3.5 fill-current" />
                                                    Start Task
                                                </button>
                                            )}
                                            {task.status === 'IN PROGRESS' && (
                                                <button
                                                    onClick={() => handleStatusChange(task.id, 'WAITING FOR REVIEW')}
                                                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
                                                >
                                                    <MessageSquareIcon className="w-3.5 h-3.5" />
                                                    Request Review
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Issues indicator */}
                                    {task.issues && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-orange-400/80">
                                            <AlertCircleIcon className="w-3 h-3" />
                                            Scope refinement issues active
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
