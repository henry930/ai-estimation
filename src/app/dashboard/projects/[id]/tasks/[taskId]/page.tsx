'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UniversalTaskDetail from '@/components/dashboard/UniversalTaskDetail';

export default function TaskDetailPage() {
    return (
        <DashboardLayout>
            <UniversalTaskDetail type="task" />
        </DashboardLayout>
    );
}
