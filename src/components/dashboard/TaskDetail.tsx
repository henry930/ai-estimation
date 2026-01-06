'use client';

import { useState, useEffect } from 'react';
import {
    ChevronLeftIcon,
    FileTextIcon,
    AlertCircleIcon,
    LinkIcon,
    CheckSquareIcon,
    ClockIcon,
    GitBranchIcon,
    MessageSquareIcon
} from 'lucide-react';
import Link from 'next/link';
import AIEnquiryPanel from './AIEnquiryPanel';

interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface TaskDocument {
    id: string;
    title: string;
    url: string;
    type: string;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    hours: number | null;
    status: string;
    branch: string | null;
    aiPrompt: string | null;
    githubIssueNumber: number | null;
    subtasks: SubTask[];
    documents: TaskDocument[];
}

type TabType = 'implementation-plan' | 'issues' | 'documents' | 'subtasks' | 'agent';

export default function TaskDetail({ taskId }: { taskId: string }) {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('implementation-plan');

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await fetch(`/api/admin/tasks/${taskId}`);
                const data = await res.json();
                if (data.success) {
                    setTask(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch task:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [taskId]);

    const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/tasks/${taskId}/subtasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subtaskId, isCompleted: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setTask(prev => prev ? {
                    ...prev,
                    subtasks: prev.subtasks.map(s => s.id === subtaskId ? { ...s, isCompleted: !currentStatus } : s)
                } : null);
            }
        } catch (err) {
            console.error('Failed to toggle subtask:', err);
        }
    };

    const handleCreateSubtask = async (title: string) => {
        if (!title.trim()) return;
        try {
            const res = await fetch(`/api/admin/tasks/${taskId}/subtasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            const data = await res.json();
            if (data.success) {
                setTask(prev => prev ? {
                    ...prev,
                    subtasks: [...prev.subtasks, data.data]
                } : null);
            }
        } catch (err) {
            console.error('Failed to create subtask:', err);
        }
    };

    const calculateProgress = () => {
        if (!task) return 0;
        if (task.status === 'DONE') return 100;
        if (task.subtasks.length === 0) return 0;

        const totalHours = task.subtasks.reduce((sum, st: any) => sum + (st.hours || 0), 0);
        if (totalHours > 0) {
            const completedHours = task.subtasks
                .filter(st => st.isCompleted)
                .reduce((sum, st: any) => sum + (st.hours || 0), 0);
            return Math.round((completedHours / totalHours) * 100);
        }

        const completed = task.subtasks.filter(st => st.isCompleted).length;
        return Math.round((completed / task.subtasks.length) * 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                <p className="text-gray-400">Task not found</p>
                <Link href="/dashboard/management" className="text-blue-400 text-sm mt-4 inline-block hover:underline">
                    Back to Management
                </Link>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'implementation-plan', label: 'Implementation Plan', icon: FileTextIcon },
        { id: 'issues', label: 'Issues', icon: AlertCircleIcon },
        { id: 'documents', label: 'Documents', icon: LinkIcon },
        { id: 'subtasks', label: 'Sub Task List', icon: CheckSquareIcon },
        { id: 'agent', label: 'AI Agent', icon: MessageSquareIcon },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/management"
                        className="p-2 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                    >
                        <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{task.title}</h1>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-gray-500">ID: {task.id.slice(0, 8)}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <div className="flex items-center gap-1.5 text-blue-400/80 font-mono">
                                <GitBranchIcon className="w-3.5 h-3.5" />
                                {task.branch || 'no-branch'}
                            </div>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <ClockIcon className="w-3.5 h-3.5" />
                                {task.hours || 0}h
                            </div>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <div className="flex items-center gap-3 w-32">
                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500/50 transition-all duration-500"
                                        style={{ width: `${calculateProgress()}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 font-mono">
                                    {calculateProgress()}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${task.status === 'DONE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    task.status === 'IN PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                    {task.status}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white/10 text-white shadow-lg'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 min-h-[400px] shadow-2xl overflow-hidden">
                {activeTab === 'implementation-plan' && (
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-white text-lg font-semibold mb-4">Implementation Plan</h3>
                        <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {task.description || 'No implementation plan provided.'}
                        </p>

                        {task.aiPrompt && (
                            <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">AI Context</h4>
                                <p className="text-sm text-blue-300/80 italic">"{task.aiPrompt}"</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold mb-6">Linked GitHub Issue</h3>
                        {task.githubIssueNumber ? (
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-bold text-white">Issue #{task.githubIssueNumber}</h4>
                                    <Link
                                        href={`/dashboard/projects/${task.id}/tasks/${task.id}`}
                                        className="text-xs text-blue-400 hover:underline"
                                    >
                                        View Full Sync & Details →
                                    </Link>
                                </div>
                                <p className="text-sm text-gray-400">
                                    This task is linked to GitHub Issue #{task.githubIssueNumber}.
                                    Visit the dedicated task page to see real-time status, labels, and comments.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                <AlertCircleIcon className="w-8 h-8 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 text-sm">No GitHub issue linked to this task.</p>
                                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500">
                                    Link Issue
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold mb-6">Related Documentation</h3>
                        {task.documents && task.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {task.documents.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/20 transition-all group"
                                    >
                                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-all">
                                            <LinkIcon className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{doc.url}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-600 italic">No documents attached.</div>
                        )}
                    </div>
                )}

                {activeTab === 'subtasks' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white text-lg font-semibold">Sub Task List</h3>
                            <div className="text-xs text-gray-500">
                                {task.subtasks.filter(s => s.isCompleted).length} / {task.subtasks.length} Completed
                            </div>
                        </div>

                        {/* New Subtask Input */}
                        <div className="mb-6 relative">
                            <input
                                type="text"
                                placeholder="Add a new sub-task..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all pr-12"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateSubtask(e.currentTarget.value);
                                        e.currentTarget.value = '';
                                    }
                                }}
                            />
                            <div className="absolute right-4 top-3.5 text-[10px] text-gray-600 font-mono">ENTER</div>
                        </div>

                        {task.subtasks && task.subtasks.length > 0 ? (
                            <div className="space-y-2">
                                {task.subtasks.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => handleToggleSubtask(sub.id, sub.isCompleted)}
                                        className="w-full flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/[0.04] hover:border-white/10 transition-all text-left"
                                    >
                                        <div className={`p-1 rounded border transition-all ${sub.isCompleted
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'bg-white/5 border-white/10 text-transparent group-hover:text-gray-600'
                                            }`}>
                                            <CheckSquareIcon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-sm transition-all ${sub.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'
                                            }`}>
                                            {sub.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-600 italic">No sub-tasks defined.</div>
                        )}
                    </div>
                )}

                {activeTab === 'agent' && (
                    <div className="h-[500px] animate-in fade-in duration-300">
                        <AIEnquiryPanel
                            taskId={task.id}
                            taskTitle={task.title}
                            onClose={() => setActiveTab('implementation-plan')}
                            hideHeader={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
