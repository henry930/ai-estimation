'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UniversalTaskDetail from '@/components/dashboard/UniversalTaskDetail';

export default function TaskDetailPage() {
    const params = useParams();
    const taskId = params.taskId as string;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <UniversalTaskDetail type="task" initialId={taskId} />
            </div>
        </DashboardLayout>
    );
}
