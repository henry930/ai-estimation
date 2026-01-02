'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CheckCircleIcon,
    CircleIcon,
    ClockIcon,
    PlayIcon,
    GitBranchIcon,
    MessageSquareIcon,
    AlertCircleIcon,
    ChevronRightIcon,
    PlusIcon,
    SearchIcon,
    XIcon
} from 'lucide-react';

interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    hours: number | null;
    status: string;
    branch: string | null;
    aiPrompt: string | null;
    issues: string | null;
    subtasks: SubTask[];
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
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold tracking-tight text-white/90">Project Management</h1>
                <p className="text-gray-500 text-[11px]">
                    Manage task activation, review, and scope refinement from this overview.
                </p>
            </div>

            {/* Task Groups */}
            <div className="space-y-8">
                {groups.map((group) => (
                    <div key={group.id} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <ChevronRightIcon className="w-4 h-4 text-blue-500/70" />
                            <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest">
                                {group.title}
                            </h2>
                            <span className="text-[10px] text-gray-600 font-mono">
                                ({group.tasks.length})
                            </span>
                        </div>

                        <div className="space-y-2">
                            {group.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`relative rounded-lg bg-[#050505] border border-white/5 p-3 hover:bg-white/[0.02] transition-all duration-200 ${updatingId === task.id ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Row 1: Title & Description */}
                                        <div className="flex items-baseline gap-3">
                                            <Link
                                                href={`/dashboard/management/${task.id}`}
                                                className="group/title flex items-center gap-1.5"
                                            >
                                                <h3 className="font-semibold text-sm text-white/90 shrink-0 group-hover/title:text-blue-400 transition-colors">
                                                    {task.title}
                                                </h3>
                                                <ChevronRightIcon className="w-3 h-3 text-white/0 group-hover/title:text-blue-400/50 -translate-x-1 group-hover/title:translate-x-0 transition-all" />
                                            </Link>
                                            <p className="text-[11px] text-gray-500 truncate italic">
                                                {task.description}
                                            </p>
                                        </div>

                                        {/* Row 2: Status | Branch | Action */}
                                        <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                            <div className="flex items-center gap-4 text-[10px]">
                                                <div className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-tighter ${getStatusStyles(task.status)}`}>
                                                    {task.status}
                                                </div>

                                                <div className="h-3 w-[1px] bg-white/10" />

                                                {task.branch ? (
                                                    <div className="flex items-center gap-1.5 font-mono text-blue-400/60">
                                                        <GitBranchIcon className="w-3 h-3" />
                                                        {task.branch}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-700 font-mono italic">no branch</span>
                                                )}

                                                {task.hours && (
                                                    <>
                                                        <div className="h-3 w-[1px] bg-white/10" />
                                                        <span className="text-gray-600">{task.hours}h</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedTaskId(task.id);
                                                    }}
                                                    className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-bold border border-white/10 transition-all flex items-center gap-1.5"
                                                    title="AI Revise & Enquiry"
                                                >
                                                    <SearchIcon className="w-2.5 h-2.5" />
                                                    Enquiry
                                                </button>

                                                {task.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleStatusChange(task.id, 'IN PROGRESS')}
                                                        className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-bold border border-white/10 transition-all flex items-center gap-1.5"
                                                    >
                                                        <PlayIcon className="w-2.5 h-2.5 fill-current" />
                                                        Activate
                                                    </button>
                                                )}
                                                {task.status === 'IN PROGRESS' && (
                                                    <button
                                                        onClick={() => handleStatusChange(task.id, 'WAITING FOR REVIEW')}
                                                        className="px-3 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-[10px] font-bold border border-purple-500/20 transition-all flex items-center gap-1.5"
                                                    >
                                                        <MessageSquareIcon className="w-2.5 h-2.5" />
                                                        Request Review
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row 3: Structured Sub-tasks as Tags */}
                                        {task.subtasks && task.subtasks.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {task.subtasks.map((sub) => (
                                                    <div
                                                        key={sub.id}
                                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border ${sub.isCompleted
                                                            ? 'bg-green-500/5 text-green-500/60 border-green-500/10'
                                                            : 'bg-orange-500/5 text-orange-400/80 border-orange-500/10'
                                                            }`}
                                                    >
                                                        {sub.isCompleted ? <CheckCircleIcon className="w-2.5 h-2.5" /> : <AlertCircleIcon className="w-2.5 h-2.5" />}
                                                        {sub.title}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Slide-over Sidebar */}
            {selectedTaskId && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTaskId(null)} />
                    <div className="absolute inset-y-0 right-0 max-w-full flex">
                        <div className="w-screen max-w-md">
                            <div className="h-full flex flex-col bg-[#0a0a0a] border-l border-white/10 shadow-2xl">
                                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Revise & Enquiry</h2>
                                        <p className="text-[11px] text-gray-500">Task: {groups.flatMap(g => g.tasks).find(t => t.id === selectedTaskId)?.title}</p>
                                    </div>
                                    <button onClick={() => setSelectedTaskId(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <XIcon className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                                        <p className="text-sm text-blue-400">
                                            How can I help you revise this task? You can ask about the branch strategy, sub-task details, or request a scope update.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/5 bg-[#080808]">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Ask AI about this task..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all pr-12"
                                        />
                                        <button className="absolute right-2 top-2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all">
                                            <PlayIcon className="w-4 h-4 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
