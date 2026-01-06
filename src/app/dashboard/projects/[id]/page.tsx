'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UniversalTaskDetail from '@/components/dashboard/UniversalTaskDetail';

export default function ProjectPage() {
    return (
        <DashboardLayout>
            <UniversalTaskDetail type="project" />
        </DashboardLayout>
    );
}
