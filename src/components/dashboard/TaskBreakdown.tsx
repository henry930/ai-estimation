'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export interface TaskItem {
    id: string;
    title: string;
    description?: string;
    objective?: string | null;
    hours: number;
    completed: boolean;
    branch?: string;
    status?: string;
    subtasks?: any[];
}

export interface TaskCategory {
    id: string;
    title: string;
    status?: string | null;
    totalHours?: number | null;
    branch?: string | null;
    tasks: TaskItem[];
}

interface TaskBreakdownProps {
    categories: TaskCategory[];
    onBranchClick?: (branch: string) => void;
}

export default function TaskBreakdown({ categories, onBranchClick }: TaskBreakdownProps) {
    const params = useParams();
    const projectId = params.id as string;

    const calculateTaskProgress = (task: TaskItem) => {
        if (task.status === 'DONE') return 100;
        if (!task.subtasks || task.subtasks.length === 0) return 0;

        const totalSubHours = task.subtasks.reduce((sum, st) => sum + (st.hours || 1), 0);
        const completedSubHours = task.subtasks
            .filter(st => st.isCompleted)
            .reduce((sum, st) => sum + (st.hours || 1), 0);

        return Math.round((completedSubHours / totalSubHours) * 100);
    };

    const calculatePhaseProgress = (category: TaskCategory) => {
        if (!category.tasks || category.tasks.length === 0) return 0;

        const totalHours = category.tasks.reduce((sum, t) => sum + (t.hours || 0), 0);
        if (totalHours === 0) {
            const sumProgress = category.tasks.reduce((sum, t) => sum + calculateTaskProgress(t), 0);
            return Math.round(sumProgress / category.tasks.length);
        }

        const progressedHours = category.tasks.reduce((sum, t) => {
            return sum + ((t.hours || 0) * (calculateTaskProgress(t) / 100));
        }, 0);

        return Math.round((progressedHours / totalHours) * 100);
    };

    return (
        <div className="space-y-8">
            {categories.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-400 text-sm">No task groups defined for this project yet.</p>
                    <p className="text-gray-600 text-xs mt-2">Sync from GitHub or create tasks manually to get started.</p>
                </div>
            ) : (
                categories.map((category) => {
                    const phaseProgress = calculatePhaseProgress(category);
                    return (
                        <div key={category.id} className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-2 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/dashboard/projects/${projectId}/tasks/${category.id}`}
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        {category.title}
                                    </Link>
                                    {category.status && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${category.status === 'DONE'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : category.status === 'IN PROGRESS'
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                : 'bg-white/5 text-gray-400 border-white/10'
                                            }`}>
                                            {category.status}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Phase Progress Bar */}
                                    {category.tasks.length > 0 && (
                                        <div className="flex items-center gap-2" title={`${phaseProgress}% Phase Completed (Hour Weighted)`}>
                                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${phaseProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-500 tabular-nums">
                                                {phaseProgress}%
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-xs font-normal text-gray-500">
                                        {category.totalHours || category.tasks.reduce((acc, t) => acc + t.hours, 0)} hours
                                    </span>
                                </div>
                            </h3>
                            <div className="space-y-3">
                                {category.tasks.map((task) => {
                                    const taskProgress = calculateTaskProgress(task);
                                    const isTaskDone = task.status === 'DONE' || task.completed;
                                    return (
                                        <div
                                            key={task.id}
                                            className="group flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                                        >
                                            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isTaskDone
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-white/20'
                                                }`}>
                                                {isTaskDone && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/dashboard/projects/${projectId}/tasks/${task.id}`}
                                                            className={`text-sm font-medium transition-colors hover:underline underline-offset-4 ${isTaskDone ? 'text-gray-500 line-through' : 'text-gray-300 group-hover:text-white'}`}
                                                        >
                                                            {task.title}
                                                        </Link>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.status === 'DONE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            task.status === 'IN PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                'bg-white/5 text-gray-500 border-white/10'
                                                            }`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {task.subtasks && task.subtasks.length > 0 && (
                                                            <div className="flex items-center gap-1.5" title={`${taskProgress}% Complete`}>
                                                                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                                        style={{ width: `${taskProgress}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-gray-500 tabular-nums">
                                                                    {taskProgress}%
                                                                </span>
                                                            </div>
                                                        )}
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">{task.hours}h</span>
                                                    </div>
                                                </div>
                                                {task.objective && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.objective}</p>
                                                )}
                                                {task.branch && (
                                                    <button
                                                        onClick={() => onBranchClick?.(task.branch!)}
                                                        className="mt-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded hover:bg-blue-500/20 transition-all font-mono"
                                                    >
                                                        Branch: {task.branch}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
