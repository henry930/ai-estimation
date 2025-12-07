'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TaskBreakdown, { Section } from '@/components/estimation/TaskBreakdown';
import ManHourSummary from '@/components/estimation/ManHourSummary';
import ExportActions from '@/components/estimation/ExportActions';

// Mock Data
const mockProject = {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Full stack online store with stripe integration',
};

const mockSections: Section[] = [
    {
        id: 's1',
        title: 'Phase 1: Foundation',
        tasks: [
            { id: 't1', name: 'Project Setup & Config', minHours: 4, maxHours: 6 },
            { id: 't2', name: 'Database Schema Design', minHours: 6, maxHours: 8 },
            { id: 't3', name: 'Authentication System', minHours: 8, maxHours: 12 },
        ]
    },
    {
        id: 's2',
        title: 'Phase 2: Core Features',
        tasks: [
            { id: 't4', name: 'Product Catalog API', minHours: 10, maxHours: 14 },
            { id: 't5', name: 'Shopping Cart Logic', minHours: 8, maxHours: 12 },
            { id: 't6', name: 'Checkout Flow', minHours: 12, maxHours: 16 },
        ]
    },
    {
        id: 's3',
        title: 'Phase 3: UI Implementation',
        tasks: [
            { id: 't7', name: 'Landing Page', minHours: 6, maxHours: 8 },
            { id: 't8', name: 'Product Details Page', minHours: 8, maxHours: 10 },
        ]
    }
];

export default function EstimationResultPage() {
    const totalMin = mockSections.reduce((acc, section) =>
        acc + section.tasks.reduce((sAcc, t) => sAcc + t.minHours, 0), 0
    );

    const totalMax = mockSections.reduce((acc, section) =>
        acc + section.tasks.reduce((sAcc, t) => sAcc + t.maxHours, 0), 0
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{mockProject.name}</h1>
                        <p className="text-gray-400">{mockProject.description}</p>
                    </div>

                    <TaskBreakdown sections={mockSections} />
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <ManHourSummary totalMin={totalMin} totalMax={totalMax} />
                    <ExportActions />
                </div>
            </div>
        </DashboardLayout>
    );
}
