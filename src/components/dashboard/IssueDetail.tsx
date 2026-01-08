'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    CheckCircle2, CircleDot, User,
    Paperclip, Edit3
} from 'lucide-react';

interface Comment {
    id: string;
    author: string;
    content: string;
    createdAt: string;
}

interface IssueDetailProps {
    task: any;
    comments: Comment[];
    onSaveComment: (content: string) => Promise<void>;
    onUpdateStatus: (status: string) => Promise<void>;
    currentUser: string;
    githubData?: any;
}

export default function IssueDetail({ task, comments, onSaveComment, onUpdateStatus, currentUser, githubData }: IssueDetailProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            await onSaveComment(newComment);
            setNewComment('');
            setActiveTab('write');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isOpen = task.status !== 'DONE';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {/* Main Content (Left 3 cols) */}
            <div className="lg:col-span-3 space-y-6">

                {/* Header */}
                <div className="border-b border-white/10 pb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xl font-light text-gray-400 flex-wrap">
                            <span className="font-mono opacity-50 truncate" title="Project Name">{task.project?.name}</span>
                            <span className="text-gray-600">/</span>
                            <span className="text-white font-semibold flex-1">{task.title}</span>
                            <span className="font-mono text-sm opacity-50">#{task.githubIssueNumber || task.id.slice(0, 6)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className={`px-3 py-1 rounded-full border flex items-center gap-2 font-medium ${isOpen ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'}`}>
                                {isOpen ? <CircleDot className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                {isOpen ? 'Open' : 'Closed'}
                            </span>
                            <span className="text-gray-500">
                                <span className="text-gray-300 font-medium">System</span> opened this issue {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                            {githubData && (
                                <a href={githubData.html_url} target="_blank" rel="noopener noreferrer" className="ml-auto px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-all">
                                    View on GitHub
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4" />
                            <span className="font-medium text-gray-300">Description</span>
                        </div>
                        <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                            <Edit3 className="w-3 h-3" /> Edit
                        </button>
                    </div>
                    <div className="p-6 prose prose-invert max-w-none text-sm text-gray-300 markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {task.description || task.objective || '_No description provided._'}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Timeline / Comments */}
                <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-white/10 pl-0">
                    {comments && comments.length > 0 && comments.map((comment) => (
                        <div key={comment.id} className="relative pl-12 group">
                            <div className="absolute left-0 top-0 p-1 bg-black rounded-full border border-white/10 z-10">
                                <User className="w-6 h-6 text-gray-500 bg-white/5 rounded-full p-1" />
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group-hover:border-blue-500/30 transition-colors">
                                <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-200">{comment.author}</span>
                                        <span className="text-gray-500">commented {new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-gray-500 cursor-default">Member</span>
                                    </div>
                                </div>
                                <div className="p-4 prose prose-invert max-w-none text-sm text-gray-300">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {comment.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* New Comment Box */}
                    <div className="relative pl-12 pt-4">
                        <div className="absolute left-0 top-4 p-1 bg-black rounded-full border border-white/10 z-10">
                            <User className="w-6 h-6 text-blue-500 bg-blue-500/10 rounded-full p-1" />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                            {/* Tabs */}
                            <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/5">
                                <button
                                    onClick={() => setActiveTab('write')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'write' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Write
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Preview
                                </button>
                            </div>

                            <div className="p-2">
                                {activeTab === 'write' ? (
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Leave a comment..."
                                        className="w-full h-32 bg-transparent text-sm text-gray-200 p-2 focus:outline-none resize-y min-h-[100px]"
                                    />
                                ) : (
                                    <div className="w-full h-32 p-4 overflow-y-auto prose prose-invert max-w-none text-sm text-gray-300 min-h-[100px]">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {newComment || '_Nothing to preview_'}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-2 bg-white/5 border-t border-white/5">
                                <div className="text-xs text-gray-500 flex items-center gap-2 px-2">
                                    <Paperclip className="w-3 h-3" />
                                    <span>Attach files by dragging & dropping...</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onUpdateStatus(isOpen ? 'DONE' : 'PENDING')}
                                        disabled={isSubmitting}
                                        className={`px-4 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors ${isOpen ? 'bg-white/5 text-gray-400 hover:bg-red-900/20 hover:text-red-400 border border-white/10' : 'bg-white/5 text-gray-400 hover:bg-green-900/20 hover:text-green-400 border border-white/10'}`}
                                    >
                                        {isOpen ? (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Close issue
                                            </>
                                        ) : (
                                            <>
                                                <CircleDot className="w-3.5 h-3.5" />
                                                Reopen issue
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCommentSubmit}
                                        disabled={isSubmitting || !newComment.trim()}
                                        className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar (Right Col) */}
            <div className="space-y-6 text-sm">
                <div className="space-y-4 pt-1">
                    <div className="border-b border-white/10 pb-4">
                        <h4 className="text-gray-500 font-medium mb-2 flex items-center justify-between group cursor-pointer hover:text-blue-400">
                            Assignees
                            <User className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <div className="text-gray-400 text-xs italic">
                            No one assigned
                        </div>
                    </div>

                    <div className="border-b border-white/10 pb-4">
                        <h4 className="text-gray-500 font-medium mb-2 flex items-center justify-between group cursor-pointer hover:text-blue-400">
                            Labels
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {task.hours && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
                                    {task.hours} Hours
                                </span>
                            )}
                            {task.githubIssueNumber && (
                                <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs">
                                    Synced
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border-b border-white/10 pb-4">
                        <h4 className="text-gray-500 font-medium mb-2 flex items-center justify-between group cursor-pointer hover:text-blue-400">
                            Branch
                        </h4>
                        <div className="font-mono text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded truncate">
                            {task.branch || 'No branch'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
