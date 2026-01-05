'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ContextSidebar from '@/components/chat/ContextSidebar';

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

interface TaskDetail {
    id: string;
    title: string;
    description: string | null;
    objective: string | null;
    status: string;
    hours: number;
    branch: string | null;
    group: {
        title: string;
        projectId: string;
        project: {
            name: string;
        };
    };
    subtasks: SubTask[];
    documents: TaskDocument[];
}

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'objective' | 'issues' | 'documents' | 'subtasks'>('objective');

    useEffect(() => {
        if (params.taskId) {
            fetchTask();
        }
    }, [params.taskId]);

    const fetchTask = async () => {
        try {
            const res = await fetch(`/api/tasks/${params.taskId}`);
            if (!res.ok) throw new Error('Failed to fetch task');
            const data = await res.json();
            setTask(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBranch = async () => {
        if (!task) return;

        // Sanitize task title to create a valid branch name
        const sanitizedTitle = task.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Assuming a simpler naming convention for now, can be improved to be hierarchical
        const branchName = `feature/${sanitizedTitle}`;

        const confirmCreate = window.confirm(`Create branch '${branchName}' for this task?`);
        if (!confirmCreate) return;

        // In a real implementation, you would call an API here to create the branch
        // await fetch('/api/github/branches/create', { ... });
        alert(`Request to create branch '${branchName}' initiated! (API Integration Pending)`);
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', objective: '', status: '' });

    useEffect(() => {
        if (task) {
            setEditForm({
                title: task.title,
                objective: task.objective || task.description || '',
                status: task.status
            });
        }
    }, [task]);

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/tasks/${params.taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title,
                    objective: editForm.objective,
                    description: editForm.objective, // Keeping description synced for now
                    status: editForm.status
                })
            });

            if (!res.ok) throw new Error('Failed to update task');

            const updatedTask = await res.json();
            setTask(prev => prev ? { ...prev, ...updatedTask } : null);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save changes');
        }
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

    if (!task) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <p className="text-gray-400">Task not found</p>
                    <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300 mt-4">
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    // Separate normal subtasks from GitHub Issues
    const githubIssues = task.subtasks.filter(st => st.title.startsWith('GitHub Issue #'));
    const checklistItems = task.subtasks.filter(st => !st.title.startsWith('GitHub Issue #'));

    return (
        <DashboardLayout rightSidebar={
            <ContextSidebar
                githubUrl={task?.group?.project?.githubUrl}
                taskId={task.id}
                onTaskRefresh={fetchTask}
            />
        }>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Breadcrumb Widget */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-mono">
                    <Link
                        href={`/dashboard/projects/${task.group.projectId}`}
                        className="hover:text-blue-400 transition-colors"
                    >
                        {task.group.project.name}
                    </Link>
                    <span className="text-gray-700">/</span>
                    <span className="text-gray-300">{task.group.title}</span>
                    <span className="text-gray-700">/</span>
                    <span className="text-white font-semibold">{task.title}</span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-2xl font-bold text-white focus:outline-none focus:border-blue-500"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold">{task.title}</h1>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-all"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-400 text-xs font-medium hover:bg-white/20 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    // Edit button for task details
                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                    Edit
                                </button>
                            )}
                            {!isEditing && (
                                task.branch ? (
                                    <a
                                        href={`https://github.com/henry930/ai-estimation/tree/${task.branch}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono flex items-center gap-2 hover:bg-blue-500/20 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                        </svg>
                                        {task.branch}
                                    </a>
                                ) : (
                                    <button
                                        onClick={handleCreateBranch}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Branch
                                    </button>
                                )
                            )}
                        </div>

                        {/* Status Badge */}
                        {isEditing ? (
                            <select
                                value={editForm.status}
                                onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="IN PROGRESS">IN PROGRESS</option>
                                <option value="WAITING FOR REVIEW">WAITING REVIEW</option>
                                <option value="DONE">DONE</option>
                            </select>
                        ) : (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${task.status === 'DONE' ? 'bg-green-500/10 text-green-500' :
                                task.status === 'IN PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-white/10 text-gray-500'
                                }`}>
                                {task.status}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10">
                    <div className="flex gap-6">
                        {['objective', 'issues', 'documents', 'subtasks'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                                    ? 'border-blue-500 text-blue-500'
                                    : 'border-transparent text-gray-500 hover:text-gray-300'
                                    } capitalize`}
                            >
                                {tab === 'subtasks' ? 'Sub Task List' : tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'objective' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-semibold mb-4 text-white">Objective</h3>
                                {isEditing ? (
                                    <textarea
                                        value={editForm.objective}
                                        onChange={e => setEditForm(prev => ({ ...prev, objective: e.target.value }))}
                                        className="w-full h-96 bg-black/20 border border-white/10 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm leading-relaxed"
                                    />
                                ) : (
                                    <div className="prose prose-invert max-w-none text-gray-300 font-light">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {task.objective || task.description || 'No objective defined for this task.'}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'issues' && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            {githubIssues.length > 0 ? (
                                githubIssues.map(issue => (
                                    <div key={issue.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${issue.isCompleted ? 'bg-purple-500' : 'bg-green-500'}`} />
                                            <span className="text-gray-200">{issue.title}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded ${issue.isCompleted ? 'bg-purple-500/10 text-purple-400' : 'bg-green-500/10 text-green-400'}`}>
                                            {issue.isCompleted ? 'Closed' : 'Open'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    No GitHub issues linked to this task.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                            {task.documents.length > 0 ? (
                                task.documents.map(doc => (
                                    <a
                                        key={doc.id}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 group-hover:text-blue-400 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-gray-200 group-hover:text-white">{doc.title}</span>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    No documents linked to this task.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'subtasks' && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            {checklistItems.length > 0 ? (
                                checklistItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.isCompleted ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                                            {item.isCompleted && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-gray-300 ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                            {item.title}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    No sub-tasks defined.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
