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
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">Project Management</h1>
                <p className="text-gray-400 text-xs">
                    Manage task activation, review pull requests, and monitor branching strategy.
                </p>
            </div>

            {/* Task Groups */}
            <div className="space-y-10">
                {groups.map((group) => (
                    <div key={group.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                                <ChevronRightIcon className="w-4 h-4 text-blue-500" />
                                {group.title}
                                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold ml-1">
                                    {group.tasks.length}
                                </span>
                            </h2>
                        </div>

                        <div className="grid gap-2">
                            {group.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`relative group rounded-xl bg-[#080808] border border-white/5 p-4 hover:bg-white/[0.03] transition-all duration-200 ${updatingId === task.id ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 transition-colors ${getStatusStyles(task.status)}`}>
                                                    {getStatusIcon(task.status)}
                                                    {task.status}
                                                </div>
                                                <h3 className="font-medium text-sm text-white/90 truncate">
                                                    {task.title}
                                                </h3>
                                                {task.branch && (
                                                    <span className="text-[10px] font-mono text-blue-400/50 bg-blue-400/5 px-1.5 py-0.5 rounded">
                                                        {task.branch}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <p className="text-xs text-gray-500 truncate max-w-xl">
                                                    {task.description}
                                                </p>
                                                {task.hours && (
                                                    <span className="text-[10px] text-gray-600 shrink-0">
                                                        {task.hours}h
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {task.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleStatusChange(task.id, 'IN PROGRESS')}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-600/90 text-white text-[10px] font-bold hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/10"
                                                >
                                                    <PlayIcon className="w-3 h-3 fill-current" />
                                                    Start
                                                </button>
                                            )}
                                            {task.status === 'IN PROGRESS' && (
                                                <button
                                                    onClick={() => handleStatusChange(task.id, 'WAITING FOR REVIEW')}
                                                    className="px-3 py-1.5 rounded-lg bg-purple-600/90 text-white text-[10px] font-bold hover:bg-purple-500 transition-all flex items-center gap-1.5 shadow-lg shadow-purple-900/10"
                                                >
                                                    <MessageSquareIcon className="w-3 h-3" />
                                                    Review
                                                </button>
                                            )}
                                            {task.issues && (
                                                <div className="p-1.5 text-orange-400/80 bg-orange-400/5 rounded-lg border border-orange-400/10" title="Scope issues active">
                                                    <AlertCircleIcon className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
    );
}
