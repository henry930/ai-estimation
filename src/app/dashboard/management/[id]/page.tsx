import TaskDetail from '@/components/dashboard/TaskDetail';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
    return <TaskDetail taskId={params.id} />;
}
