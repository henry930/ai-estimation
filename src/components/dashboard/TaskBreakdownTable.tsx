'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import BranchBadge from './BranchBadge';

export interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
    hours?: number;
    githubIssueNumber?: number;
}

export interface TaskItem {
    id: string;
    title: string;
    description?: string;
    objective?: string | null;
    hours: number;
    completed: boolean;
    branch?: string;
    status?: string;
    subtasks?: SubTask[];
}

export interface TaskCategory {
    id: string;
    title: string;
    status?: string | null;
    totalHours?: number | null;
    branch?: string | null;
    tasks: TaskItem[];
}

interface TaskBreakdownTableProps {
    categories: TaskCategory[];
    onBranchClick?: (branch: string) => void;
    githubUrl?: string;
}

export default function TaskBreakdownTable({ categories, onBranchClick, githubUrl }: TaskBreakdownTableProps) {
    const params = useParams();
    const projectId = params.id as string;
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(categories.map(c => c.id)));
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

    const toggleGroup = (groupId: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
    };

    const toggleTask = (taskId: string) => {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedTasks(newExpanded);
    };

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

    const getStatusBadge = (status?: string | null) => {
        if (!status) return null;

        const statusColors = {
            'DONE': 'bg-green-500/10 text-green-400 border-green-500/30',
            'IN PROGRESS': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            'PENDING': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
            'WAITING FOR REVIEW': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        };

        return (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusColors[status as keyof typeof statusColors] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                {status}
            </span>
        );
    };

    if (categories.length === 0) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-gray-400 text-sm">No task groups defined for this project yet.</p>
                <p className="text-gray-600 text-xs mt-2">Sync from GitHub or create tasks manually to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Task</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">Status</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">Progress</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">Hours</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">Branch</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, categoryIndex) => {
                        const isGroupExpanded = expandedGroups.has(category.id);
                        const phaseProgress = calculatePhaseProgress(category);
                        const totalHours = category.totalHours || category.tasks.reduce((acc, t) => acc + t.hours, 0);

                        return (
                            <>
                                {/* Task Group Row */}
                                <tr
                                    key={category.id}
                                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${categoryIndex > 0 ? 'border-t-2 border-white/10' : ''}`}
                                    onClick={() => toggleGroup(category.id)}
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <button className="text-gray-400 hover:text-white transition-colors">
                                                {isGroupExpanded ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                            <Link
                                                href={`/dashboard/projects/${projectId}/groups/${category.id}`}
                                                className="font-semibold text-white hover:text-blue-400 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {category.title}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {getStatusBadge(category.status)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${phaseProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400 tabular-nums w-10 text-right">
                                                {phaseProgress}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="text-sm font-medium text-gray-300">{totalHours}h</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {category.branch && (
                                            <BranchBadge
                                                branch={category.branch}
                                                githubRepoUrl={githubUrl}
                                                size="md"
                                                onClick={() => onBranchClick?.(category.branch!)}
                                            />
                                        )}
                                    </td>
                                </tr>

                                {/* Tasks Rows (when group is expanded) */}
                                {isGroupExpanded && category.tasks.map((task) => {
                                    const isTaskExpanded = expandedTasks.has(task.id);
                                    const taskProgress = calculateTaskProgress(task);
                                    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

                                    return (
                                        <>
                                            {/* Task Row */}
                                            <tr
                                                key={task.id}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => hasSubtasks && toggleTask(task.id)}
                                            >
                                                <td className="py-3 px-4 pl-12">
                                                    <div className="flex items-center gap-3">
                                                        {hasSubtasks ? (
                                                            <button className="text-gray-400 hover:text-white transition-colors">
                                                                {isTaskExpanded ? (
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <div className="w-3.5" />
                                                        )}
                                                        {task.status === 'DONE' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-gray-500 shrink-0" />
                                                        )}
                                                        <Link
                                                            href={`/dashboard/projects/${projectId}/tasks/${task.id}`}
                                                            className={`text-sm hover:underline underline-offset-4 transition-colors ${task.status === 'DONE' ? 'text-gray-500 line-through' : 'text-gray-300 hover:text-white'}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {task.title}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {getStatusBadge(task.status)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {hasSubtasks && (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                                    style={{ width: `${taskProgress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 tabular-nums w-8 text-right">
                                                                {taskProgress}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-sm text-gray-400">{task.hours}h</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {task.branch && (
                                                        <BranchBadge
                                                            branch={task.branch}
                                                            githubRepoUrl={githubUrl}
                                                            size="sm"
                                                            onClick={() => onBranchClick?.(task.branch!)}
                                                        />
                                                    )}
                                                </td>
                                            </tr>

                                            {/* Subtasks Rows (when task is expanded) */}
                                            {isTaskExpanded && hasSubtasks && task.subtasks!.map((subtask) => (
                                                <tr
                                                    key={subtask.id}
                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="py-2 px-4 pl-24">
                                                        <div className="flex items-center gap-2">
                                                            {subtask.isCompleted ? (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                                            ) : (
                                                                <Circle className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                                            )}
                                                            <span className={`text-xs ${subtask.isCompleted ? 'text-gray-500 line-through' : 'text-gray-400'}`}>
                                                                {subtask.title}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 text-center">
                                                        {subtask.isCompleted ? (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-green-500/10 text-green-400 border-green-500/30">
                                                                DONE
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-gray-500/10 text-gray-400 border-gray-500/30">
                                                                TODO
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4" />
                                                    <td className="py-2 px-4 text-right">
                                                        <span className="text-xs text-gray-500">{subtask.hours || 1}h</span>
                                                    </td>
                                                    <td className="py-2 px-4 text-center">
                                                        {subtask.githubIssueNumber && (
                                                            <span className="text-[10px] text-gray-500 font-mono">
                                                                #{subtask.githubIssueNumber}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    );
                                })}
                            </>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
