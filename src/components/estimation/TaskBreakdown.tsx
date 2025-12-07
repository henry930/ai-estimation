'use client';

import { useState } from 'react';

export interface Section {
    id: string;
    title: string;
    tasks: TaskItem[];
}

export interface TaskItem {
    id: string;
    name: string;
    minHours: number;
    maxHours: number;
}

export default function TaskBreakdown({ sections }: { sections: Section[] }) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>(
        sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
    );

    const toggleSection = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-4">
            {sections.map(section => (
                <div key={section.id} className="border border-white/10 rounded-xl overflow-hidden bg-[#111]">
                    <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <ChevronIcon className={`transition-transform ${expanded[section.id] ? 'rotate-90' : ''}`} />
                            <h3 className="font-semibold text-lg">{section.title}</h3>
                        </div>
                        <span className="text-sm text-gray-400">
                            {section.tasks.length} tasks
                        </span>
                    </button>

                    {expanded[section.id] && (
                        <div className="p-2">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 uppercase">
                                        <th className="p-3 font-medium">Task Name</th>
                                        <th className="p-3 font-medium text-right w-32">Hours (Min)</th>
                                        <th className="p-3 font-medium text-right w-32">Hours (Max)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {section.tasks.map(task => (
                                        <tr key={task.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-sm">{task.name}</td>
                                            <td className="p-3 text-sm text-right font-mono text-gray-400">{task.minHours}</td>
                                            <td className="p-3 text-sm text-right font-mono text-gray-400">{task.maxHours}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function ChevronIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ${className}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
    );
}
