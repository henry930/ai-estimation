'use client';

import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string;
    status: 'Draft' | 'In Progress' | 'Completed';
    lastUpdated: string;
    estimatedHours?: number;
}

const mockProjects: Project[] = [
    {
        id: '1',
        name: 'E-commerce Platform',
        description: 'Full stack e-commerce solution with Next.js and Stripe',
        status: 'Completed',
        lastUpdated: '2h ago',
        estimatedHours: 120,
    },
    {
        id: '2',
        name: 'Mobile App API',
        description: 'REST API backend for iOS application',
        status: 'In Progress',
        lastUpdated: '1d ago',
        estimatedHours: 45,
    },
    {
        id: '3',
        name: 'Portfolio Site',
        description: 'Personal portfolio with blog',
        status: 'Draft',
        lastUpdated: '3d ago',
    },
];

export default function ProjectList() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Projects</h2>
                <Link href="/dashboard/projects" className="text-sm text-blue-400 hover:text-blue-300">
                    View all
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                {project.status}
                            </div>
                            <span className="text-xs text-gray-500">{project.lastUpdated}</span>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                            {project.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <ClockIcon />
                            <span>{project.estimatedHours ? `${project.estimatedHours}h estimated` : 'Not estimated'}</span>
                        </div>
                    </Link>
                ))}

                {/* New Project Card Placeholder */}
                <Link
                    href="/estimate/new"
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-gray-500 hover:text-white"
                >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <PlusIcon />
                    </div>
                    <span className="font-medium">Create New Project</span>
                </Link>
            </div>
        </div>
    );
}

function getStatusColor(status: Project['status']) {
    switch (status) {
        case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'In Progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'Draft': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}
