'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BotIcon, FileTextIcon, FileCodeIcon, LayoutDashboardIcon, CheckCircle2, Circle, Clock, ListPlus } from 'lucide-react';
import AIEnquiryPanel from './AIEnquiryPanel';
import ProjectAgentPanel from './ProjectAgentPanel';
import DashboardLayout from './DashboardLayout';
import TaskBreakdownTable from './TaskBreakdownTable';
import IssueList from './IssueList';
import IssueDetail from './IssueDetail';

interface NodeItem {
    id: string;
    title: string;
    description: string | null;
    objective: string | null;
    status: string;
    hours: number;
    branch: string | null;
    githubIssueNumber: number | null;
    type: string;
}

interface UnifiedNode {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    objective: string | null;
    status: string;
    hours: number;
    branch: string | null;
    githubIssueNumber: number | null;
    type: string;
    aiInstructions: string | null;
    parentId: string | null;
    level: number;
    project: {
        name: string;
        githubUrl: string | null;
    };
    parent?: {
        id: string;
        title: string;
    } | null;
    children: NodeItem[];
    documents: {
        id: string;
        title: string;
        url: string;
        type: string;
    }[];
    comments?: {
        id: string;
        author: string;
        content: string;
        createdAt: string;
    }[];
}

interface UniversalTaskDetailProps {
    type: 'project' | 'task';
    initialId?: string;
}

export default function UniversalTaskDetail({ type, initialId }: UniversalTaskDetailProps) {
    const params = useParams();
    const router = useRouter();
    const id = initialId || (type === 'project' ? params.id : params.taskId) as string;

    const [node, setNode] = useState<UnifiedNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'implementation-plan' | 'issues' | 'documents' | 'subtasks' | 'report' | 'agent' | 'master-mind'>('subtasks');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', objective: '', status: '', aiInstructions: '' });
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [issueData, setIssueData] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLocatingAI, setIsLocatingAI] = useState(false);
    const [issueSubTab, setIssueSubTab] = useState<'list' | 'discussion'>('discussion');

    useEffect(() => {
        if (id) {
            fetchNode();
        }
    }, [id, type]);

    const fetchNode = async () => {
        try {
            setLoading(true);
            const endpoint = type === 'project' ? `/api/projects/${id}/root` : `/api/tasks/${id}`;
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();

            // Normalize Project to Node structure if needed
            const normalizedData = type === 'project' ? normalizeProject(data) : data;

            if (!node && normalizedData.type === 'ISSUE') {
                setActiveTab('issues');
            }
            setNode(normalizedData);
            setEditForm({
                title: normalizedData.title,
                objective: normalizedData.objective || normalizedData.description || '',
                status: normalizedData.status,
                aiInstructions: normalizedData.aiInstructions || ''
            });

            // Handle breakdown (Tasks List)
            if (type === 'project') {
                const breakdownRes = await fetch(`/api/projects/${id}/tasks`);
                if (breakdownRes.ok) {
                    const breakdownData = await breakdownRes.json();
                    setBreakdown(breakdownData);
                }
            } else if (normalizedData.breakdown) {
                setBreakdown(normalizedData.breakdown);
            }

            // Handle GitHub Issue
            if (normalizedData.githubIssueNumber && normalizedData.project.githubUrl) {
                const urlParts = normalizedData.project.githubUrl.split('/');
                const owner = urlParts[3];
                const repo = urlParts[4];
                const issueRes = await fetch(`/api/github/issues/${normalizedData.githubIssueNumber}?owner=${owner}&repo=${repo}`);
                if (issueRes.ok) {
                    const issueJson = await issueRes.json();
                    setIssueData(issueJson.data);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const normalizeProject = (project: any) => ({
        id: project.id,
        projectId: project.id,
        title: project.name,
        description: project.description,
        objective: project.objective,
        status: project.status || 'active',
        hours: project.totalHours || 0,
        branch: null,
        githubIssueNumber: null,
        parentId: null,
        level: -1,
        project: {
            name: project.name,
            githubUrl: project.githubUrl
        },
        children: project.tasks || [],
        documents: project.documents || [],
        aiInstructions: project.aiInstructions || null
    });

    const handleSave = async () => {
        try {
            const endpoint = type === 'project' ? `/api/projects/${id}` : `/api/tasks/${id}`;
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: type === 'project' ? undefined : editForm.title,
                    name: type === 'project' ? editForm.title : undefined,
                    objective: editForm.objective,
                    description: editForm.objective,
                    status: editForm.status,
                    aiInstructions: type === 'project' ? editForm.aiInstructions : undefined
                })
            });

            if (!res.ok) throw new Error('Failed to update');
            const updated = await res.json();
            setNode(prev => prev ? { ...prev, ...updated, title: updated.title || updated.name } : null);
            setIsEditing(false);
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save changes');
        }
    };

    const handleUpdateTaskStatus = async (status: string) => {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            await fetchNode();
        } catch (error) {
            console.error('Status update error:', error);
            alert('Failed to update status');
        }
    };

    const handleAutoLocate = async () => {
        setIsLocatingAI(true);
        try {
            const res = await fetch(`/api/tasks/${id}/auto-locate`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                await fetchNode();
            } else {
                alert(data.message || 'AI could not find a location');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to auto-locate');
        } finally {
            setIsLocatingAI(false);
        }
    };

    const handleConvertToTask = async () => {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'TASK' })
            });
            if (!res.ok) throw new Error('Failed to convert');
            const updated = await res.json();
            setNode(prev => prev ? { ...prev, type: 'TASK' } : null);
            setActiveTab('subtasks');
            alert('Converted to task successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to convert');
        }
    };

    const handleAddComment = async (content: string) => {
        try {
            const res = await fetch(`/api/tasks/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            if (!res.ok) throw new Error('Failed to add comment');
            await fetchNode();
        } catch (error) {
            console.error('Comment error:', error);
            alert('Failed to post comment');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name.split('.')[0]); // Default title sans extension

            const res = await fetch(`/api/projects/${id}/master-mind/upload`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            // Refresh node to show new document
            await fetchNode();
            alert('Knowledge successfully added to Master Mind!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload knowledge');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const calculateProgress = () => {
        if (!node) return 0;
        if (node.status === 'DONE') return 100;
        if (!node.children || node.children.length === 0) return 0;

        const completed = node.children.filter(c => c.status === 'DONE').length;
        return Math.round((completed / node.children.length) * 100);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!node) return (
        <div className="text-center py-20">
            <p className="text-gray-400">Content not found</p>
            <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300 mt-4">Go Back</button>
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Breadcrumb / Context */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-mono">
                {type !== 'project' && (
                    <>
                        <Link href={`/dashboard/projects/${node.projectId}`} className="hover:text-blue-400 transition-colors">
                            {node.project.name}
                        </Link>
                        {node.parent && (
                            <>
                                <span className="text-gray-700">/</span>
                                <Link href={`/dashboard/projects/${node.projectId}/tasks/${node.parent.id}`} className="hover:text-blue-400 transition-colors">
                                    {node.parent.title}
                                </Link>
                            </>
                        )}
                        <span className="text-gray-700">/</span>
                        <span className="text-white font-semibold">{node.title}</span>
                    </>
                )}
                {type === 'project' && (
                    <span className="text-white font-semibold">{node.title} (Project Root)</span>
                )}
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
                            <h1 className="text-3xl font-bold">{node.title}</h1>
                            <div className="flex items-center gap-3 max-w-sm">
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${calculateProgress()}%` }} />
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
                            <>
                                {type === 'project' && (
                                    <>
                                        {node.project.githubUrl && (
                                            <a
                                                href={node.project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs flex items-center gap-2 text-gray-400 hover:text-white"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" />
                                                </svg>
                                                GitHub
                                            </a>
                                        )}
                                        <Link
                                            href={`/estimate/new?projectId=${node.id}`}
                                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all text-xs font-medium text-white"
                                        >
                                            New Estimation
                                        </Link>
                                    </>
                                )}
                                {node?.parentId === null && (
                                    <button
                                        onClick={handleAutoLocate}
                                        disabled={isLocatingAI}
                                        className="px-3 py-1.5 rounded-lg bg-indigo-900/40 text-indigo-400 border border-indigo-500/20 text-xs hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <ListPlus className="w-3.5 h-3.5" />
                                        {isLocatingAI ? 'AI Organizing...' : 'To Do'}
                                    </button>
                                )}
                                {node?.type === 'ISSUE' && (
                                    <button
                                        onClick={handleConvertToTask}
                                        className="px-3 py-1.5 rounded-lg bg-blue-900/40 text-blue-400 border border-blue-500/20 text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        Convert to Task
                                    </button>
                                )}
                                <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                                    Edit
                                </button>
                            </>
                        )}
                    </div>
                    {!isEditing && (
                        <div className="flex items-center gap-2">
                            {node.branch && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-mono">
                                    {node.branch}
                                </span>
                            )}
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${node.status === 'DONE' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {node.status || 'PENDING'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-b border-white/10">
                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                    {['subtasks', 'implementation-plan', 'issues', 'documents', 'master-mind', 'report', 'agent'].filter(tab => {
                        if (node?.type === 'ISSUE') {
                            return ['issues', 'documents', 'agent'].includes(tab);
                        }
                        return true;
                    }).map((tab) => {
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-300'} capitalize`}
                            >
                                {tab === 'agent' && <BotIcon className="w-4 h-4" />}
                                {tab === 'master-mind' && <LayoutDashboardIcon className="w-4 h-4" />}
                                {tab === 'subtasks' ? 'Task List' :
                                    tab === 'agent' ? 'AI Agent' :
                                        tab === 'report' ? 'Report' :
                                            tab === 'implementation-plan' ? 'Implementation Plan' :
                                                tab === 'issues' ? 'Issues' :
                                                    tab === 'master-mind' ? 'Master Mind' :
                                                        tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Panels */}
            <div className="min-h-[400px]">
                {activeTab === 'implementation-plan' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                                <FileCodeIcon className="w-5 h-5 text-blue-400" />
                                Implementation Plan
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={editForm.objective}
                                    onChange={e => setEditForm(prev => ({ ...prev, objective: e.target.value }))}
                                    className="w-full h-96 bg-black/20 border border-white/10 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm leading-relaxed"
                                />
                            ) : (
                                <div className="prose prose-invert max-w-none text-gray-300 font-light markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {node.objective || node.description || 'No implementation plan defined.'}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {type === 'project' && isEditing && (
                            <div className="mt-6 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                <h3 className="text-sm font-semibold mb-3 text-blue-400 flex items-center gap-2">
                                    <BotIcon className="w-4 h-4" />
                                    AI Agent Instructions (Training)
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    These instructions are persistent. The AI Agent will use this "knowledge" for all strategic decisions,
                                    report generation, and plan restructuring for this project.
                                </p>
                                <textarea
                                    value={editForm.aiInstructions}
                                    onChange={e => setEditForm(prev => ({ ...prev, aiInstructions: e.target.value }))}
                                    placeholder="e.g. Always use Tailwind CSS, prioritize AWS regions in Europe, follow multi-tenant architecture..."
                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
                                />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div className="animate-in fade-in duration-300">
                        {type === 'project' ? (
                            <IssueList categories={breakdown} />
                        ) : (
                            <div className="space-y-6">
                                {/* Sub-tabs */}
                                <div className="flex gap-6 border-b border-white/10 mb-6">
                                    <button
                                        onClick={() => setIssueSubTab('list')}
                                        className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 group ${issueSubTab === 'list' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                                    >
                                        Issues
                                        <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs text-gray-400 ml-1 group-hover:bg-white/20 transition-colors">
                                            {node?.children?.length || 0}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setIssueSubTab('discussion')}
                                        className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${issueSubTab === 'discussion' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                                    >
                                        Discussion
                                    </button>
                                </div>

                                {/* Content */}
                                {issueSubTab === 'list' ? (
                                    <div className="animate-in fade-in duration-300">
                                        <IssueList
                                            initialIssues={node?.children || []}
                                            parentId={node?.id}
                                            creationType="ISSUE"
                                        />
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-300">
                                        <IssueDetail
                                            task={node}
                                            comments={node?.comments || []}
                                            onSaveComment={handleAddComment}
                                            onUpdateStatus={handleUpdateTaskStatus}
                                            currentUser="User"
                                            githubData={issueData}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'subtasks' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <TaskBreakdownTable
                            categories={breakdown}
                            githubUrl={node.project.githubUrl || undefined}
                        />
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                        {node.documents.length > 0 ? node.documents.map(doc => (
                            <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5 group-hover:text-blue-400 transition-colors">
                                    <FileTextIcon className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-gray-200 group-hover:text-white">{doc.title}</span>
                            </a>
                        )) : (
                            <div className="col-span-full text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                                No documents linked here.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'report' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Node Progress</h3>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold text-white">{calculateProgress()}%</div>
                                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${node.status === 'DONE' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {node.status}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Estimated Effort</h3>
                                <div className="text-3xl font-bold text-white">{node.hours} Hours</div>
                                <p className="text-xs text-gray-500 mt-2">Allocated time for this {type}.</p>
                            </div>
                        </div>

                        {/* Report Content */}
                        <ReportContent node={node} />
                    </div>
                )}
                {activeTab === 'master-mind' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                                <LayoutDashboardIcon className="w-5 h-5 text-blue-400" />
                                Master Mind Repository
                            </h3>
                            <p className="text-sm text-gray-400 mb-6">
                                This repository contains persistent instructions that "tune" the AI Agent's behavior.
                                Give commands like "You must..." in the AI Agent tab to update this repository.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Upload Trigger */}
                                <div className="p-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {isUploading ? (
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FileTextIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                    <span className="text-xs text-gray-400 font-medium">
                                        {isUploading ? 'Uploading...' : 'Upload Knowledge (Design/Docs/API)'}
                                    </span>
                                </div>

                                {node.documents.filter(d => d.type === 'master_mind').length > 0 ? (
                                    node.documents.filter(d => d.type === 'master_mind').map(doc => (
                                        <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 group-hover:text-blue-400 transition-colors">
                                                <FileCodeIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-200 group-hover:text-white truncate">{doc.title}</div>
                                                <div className="text-[10px] text-gray-500 font-mono truncate">master-mind/{doc.title}.md</div>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                                        No Master Mind files detected. Training required.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'agent' && (
                    <div className="h-[calc(100vh-220px)] min-h-[600px] border border-white/10 rounded-2xl overflow-hidden animate-in fade-in duration-300 shadow-2xl">
                        {type === 'project' ? (
                            <ProjectAgentPanel
                                projectId={node.id}
                                projectName={node.title}
                            />
                        ) : (
                            <AIEnquiryPanel
                                taskId={node.id}
                                taskTitle={node.title}
                                onClose={() => setActiveTab('subtasks')}
                                hideHeader={true}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ReportContent({ node }: { node: UnifiedNode }) {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const reportDoc = node.documents.find(d => d.title === 'Completion Report');
        if (reportDoc) {
            setLoading(true);
            fetch(reportDoc.url)
                .then(res => res.text())
                .then(text => setContent(text))
                .catch(err => console.error('Failed to load report:', err))
                .finally(() => setLoading(false));
        }
    }, [node]);

    if (!node.documents.some(d => d.title === 'Completion Report')) return null;

    if (loading) return <div className="p-6 text-gray-500">Loading report...</div>;

    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-purple-400" />
                Completion Report
            </h3>
            <div className="prose prose-invert max-w-none text-gray-300 font-light markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || 'Failed to load content.'}
                </ReactMarkdown>
            </div>
        </div>
    );
}
