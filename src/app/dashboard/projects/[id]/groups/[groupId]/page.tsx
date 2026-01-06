'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AIEnquiryPanel from '@/components/dashboard/AIEnquiryPanel';

interface Task {
    id: string;
    title: string;
    status: string;
    hours: number;
    objective: string | null;
}

interface TaskDocument {
    id: string;
    title: string;
    url: string;
    type: string;
}

interface GroupDetail {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    objective: string | null;
    status: string;
    totalHours: number;
    branch: string | null;
    githubIssueNumber: number | null;
    project: {
        name: string;
        githubUrl: string | null;
    };
    tasks: Task[];
    documents: TaskDocument[];
}

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [group, setGroup] = useState<GroupDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'objective' | 'issues' | 'documents' | 'tasks' | 'enquiry'>('objective');
    const [githubIssue, setGithubIssue] = useState<any>(null);
    const [fetchingIssue, setFetchingIssue] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', objective: '', status: '' });

    useEffect(() => {
        if (params.groupId) {
            fetchGroup();
        }
    }, [params.groupId]);

    useEffect(() => {
        if (activeTab === 'issues' && group?.githubIssueNumber && group?.project?.githubUrl) {
            fetchGitHubIssue();
        }
    }, [activeTab, group?.githubIssueNumber]);

    const fetchGitHubIssue = async () => {
        if (!group || !group.githubIssueNumber) return;

        setFetchingIssue(true);
        try {
            const match = group.project.githubUrl?.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match) return;

            const [_, owner, repo] = match;
            const res = await fetch(`/api/github/issues/${group.githubIssueNumber}?owner=${owner}&repo=${repo}`);
            if (res.ok) {
                const data = await res.json();
                setGithubIssue(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch GitHub issue:', err);
        } finally {
            setFetchingIssue(false);
        }
    };

    const fetchGroup = async () => {
        try {
            const res = await fetch(`/api/groups/${params.groupId}`);
            if (!res.ok) throw new Error('Failed to fetch group');
            const data = await res.json();
            setGroup(data);
            setEditForm({
                title: data.title,
                objective: data.objective || data.description || '',
                status: data.status || 'PENDING'
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/groups/${params.groupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title,
                    objective: editForm.objective,
                    description: editForm.objective,
                    status: editForm.status
                })
            });

            if (!res.ok) throw new Error('Failed to update group');

            const updatedGroup = await res.json();
            setGroup(prev => prev ? { ...prev, ...updatedGroup } : null);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save group:', error);
            alert('Failed to save changes');
        }
    };

    const calculateProgress = () => {
        if (!group || !group.tasks || group.tasks.length === 0) return 0;
        if (group.status === 'DONE') return 100;

        const completedTasks = group.tasks.filter(t => t.status === 'DONE').length;
        return Math.round((completedTasks / group.tasks.length) * 100);
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

    if (!group) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <p className="text-gray-400">Group not found</p>
                    <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300 mt-4">
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-mono">
                    <Link
                        href={`/dashboard/projects/${group.projectId}`}
                        className="hover:text-blue-400 transition-colors"
                    >
                        {group.project.name}
                    </Link>
                    <span className="text-gray-700">/</span>
                    <span className="text-white font-semibold">{group.title}</span>
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
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold">{group.title}</h1>
                                <div className="flex items-center gap-3 max-w-sm">
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${calculateProgress()}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">{calculateProgress()}% Complete</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-all">Save</button>
                                    <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-400 text-xs font-medium hover:bg-white/20 transition-all">Cancel</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                                    Edit Phase
                                </button>
                            )}
                        </div>
                        {!isEditing && (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${group.status === 'DONE' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {group.status || 'PENDING'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10">
                    <div className="flex gap-6">
                        {['objective', 'issues', 'documents', 'tasks', 'enquiry'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-300'} capitalize`}
                            >
                                {tab === 'tasks' ? 'Tasks in Phase' : tab === 'enquiry' ? 'AI Agent' : tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'objective' && (
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-lg font-semibold mb-4 text-white">Phase Objective</h3>
                            {isEditing ? (
                                <textarea
                                    value={editForm.objective}
                                    onChange={e => setEditForm(prev => ({ ...prev, objective: e.target.value }))}
                                    className="w-full h-96 bg-black/20 border border-white/10 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm leading-relaxed"
                                />
                            ) : (
                                <div className="prose prose-invert max-w-none text-gray-300 font-light">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {group.objective || group.description || 'No objective defined for this phase.'}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-3">
                            {group.tasks.length > 0 ? group.tasks.map(task => (
                                <Link
                                    key={task.id}
                                    href={`/dashboard/projects/${group.projectId}/tasks/${task.id}`}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${task.status === 'DONE' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                        <span className="text-gray-200 group-hover:text-white font-medium">{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-500 font-mono">{task.hours}h</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${task.status === 'DONE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </Link>
                            )) : <p className="text-center py-12 text-gray-500">No tasks in this phase.</p>}
                        </div>
                    )}

                    {activeTab === 'issues' && (
                        <div className="space-y-6">
                            {fetchingIssue ? (
                                <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                            ) : githubIssue ? (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                                <span className="text-gray-500">#{githubIssue.number}</span>
                                                {githubIssue.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${githubIssue.state === 'open' ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-400'}`}>{githubIssue.state}</span>
                                        </div>
                                        <a href={githubIssue.html_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium hover:bg-white/10 transition-all text-gray-300">View on GitHub</a>
                                    </div>
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-400 border-t border-white/5 pt-4">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{githubIssue.body || 'No description provided.'}</ReactMarkdown>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center">
                                    <h3 className="text-white font-semibold">No GitHub Issue Linked to Phase</h3>
                                    <p className="text-gray-500 text-sm mt-1 mb-6">Link this whole phase to a GitHub Epic or tracking issue.</p>
                                    <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/20">Link Issue</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.documents.length > 0 ? group.documents.map(doc => (
                                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                                    <span className="font-medium text-gray-200 group-hover:text-white">{doc.title}</span>
                                </a>
                            )) : <p className="col-span-full text-center py-12 text-gray-500">No documents linked to this phase.</p>}
                        </div>
                    )}

                    {activeTab === 'enquiry' && (
                        <div className="h-[600px] border border-white/10 rounded-2xl overflow-hidden">
                            <AIEnquiryPanel
                                groupId={group.id}
                                taskTitle={group.title}
                                onClose={() => setActiveTab('objective')}
                                hideHeader={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
