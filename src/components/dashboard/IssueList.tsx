'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Search, Filter, CircleDot, CheckCircle2, MessageSquare } from 'lucide-react';

interface IssueItem {
    id: string;
    title: string;
    status: string;
    completed: boolean;
    githubIssueNumber?: number | null;
    hours?: number;
    labels?: string[];
    author?: string;
    createdAt?: string;
    commentsCount?: number;
}

interface IssueListProps {
    categories: any[];
}

export default function IssueList({ categories }: IssueListProps) {
    const params = useParams();
    const projectId = params.id as string;
    const [filterStatus, setFilterStatus] = useState<'open' | 'closed'>('open');
    const [searchQuery, setSearchQuery] = useState('');

    // Flatten logic: Convert hierarchical categories/tasks/subtasks into a flat issue list
    const issues = useMemo(() => {
        const allIssues: IssueItem[] = [];

        categories.forEach(cat => {
            // Level 1: Main Tasks (Issues)
            cat.tasks.forEach((task: any) => {
                allIssues.push({
                    id: task.id,
                    title: task.title,
                    status: task.status,
                    completed: task.status === 'DONE',
                    githubIssueNumber: task.githubIssueNumber,
                    hours: task.hours,
                    labels: [cat.title], // Use Category title as a label
                    commentsCount: 0 // Placeholder until we fetch comment counts
                });

                // Level 2: Subtasks (Optional, treated as smaller issues or just subtasks)
                // For a flattened view, we can include them with a 'Subtask' label
                if (task.subtasks) {
                    task.subtasks.forEach((sub: any) => {
                        allIssues.push({
                            id: sub.id,
                            title: sub.title,
                            status: sub.isCompleted ? 'DONE' : 'PENDING',
                            completed: sub.isCompleted,
                            githubIssueNumber: sub.githubIssueNumber,
                            hours: sub.hours,
                            labels: ['Subtask', cat.title],
                            commentsCount: 0
                        });
                    });
                }
            });
        });

        return allIssues;
    }, [categories]);

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (issue.githubIssueNumber && issue.githubIssueNumber.toString().includes(searchQuery));

        const isOpen = !issue.completed;
        const matchesStatus = filterStatus === 'open' ? isOpen : !isOpen;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-4 text-sm">
                    <button
                        onClick={() => setFilterStatus('open')}
                        className={`flex items-center gap-2 font-medium transition-colors ${filterStatus === 'open' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <CircleDot className="w-4 h-4" />
                        {issues.filter(i => !i.completed).length} Open
                    </button>
                    <button
                        onClick={() => setFilterStatus('closed')}
                        className={`flex items-center gap-2 font-medium transition-colors ${filterStatus === 'closed' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {issues.filter(i => i.completed).length} Closed
                    </button>
                </div>

                <div className="flex-1 w-full md:w-auto flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search all issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500 placeholder:text-gray-600 transition-colors"
                        />
                    </div>

                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>

                    <Link
                        href={`/dashboard/projects/${projectId}/tasks/new`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium text-white transition-all shadow-lg shadow-green-900/20"
                    >
                        New Issue
                    </Link>
                </div>
            </div>

            {/* Issue List */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden min-h-[400px]">
                {filteredIssues.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {filteredIssues.map((issue) => (
                            <div key={issue.id} className="p-4 hover:bg-white/5 transition-colors group flex items-start gap-3 relative">
                                <div className="pt-1 mt-0.5">
                                    {issue.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                    ) : (
                                        <CircleDot className="w-4 h-4 text-green-500" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Link
                                            href={`/dashboard/projects/${projectId}/tasks/${issue.id}`}
                                            className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors text-base"
                                        >
                                            {issue.title}
                                        </Link>
                                        {issue.labels?.map(label => (
                                            <span key={label} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${label === 'Subtask' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                {label}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                                        <span>#{issue.githubIssueNumber || issue.id.slice(0, 8)}</span>
                                        <span>opened recently</span>
                                    </div>
                                </div>

                                <div className="hidden sm:flex items-center gap-4 text-gray-500">
                                    {issue.commentsCount! > 0 && (
                                        <div className="flex items-center gap-1 hover:text-blue-400">
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="text-xs">{issue.commentsCount}</span>
                                        </div>
                                    )}
                                    {issue.hours && (
                                        <div className="px-2 py-1 bg-white/5 rounded text-xs font-mono">
                                            {issue.hours}h
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Filter className="w-10 h-10 mb-4 opacity-20" />
                        <p>No issues found matching your filters.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setFilterStatus('open'); }}
                            className="mt-4 text-blue-400 hover:underline text-sm"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
