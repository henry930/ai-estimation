'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UniversalTaskDetail from '@/components/dashboard/UniversalTaskDetail';
import { useParams } from 'next/navigation';

export default function ManagementTaskDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <DashboardLayout>
            <UniversalTaskDetail type="task" initialId={id} />
        </DashboardLayout>
    );
}
