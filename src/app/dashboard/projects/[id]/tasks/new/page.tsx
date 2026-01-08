'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Suspense } from 'react';

function NewTaskContent() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;
    const searchParams = useSearchParams();
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type') || 'TASK';
    const isIssue = type === 'ISSUE';

    const [form, setForm] = useState({ title: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, parentId, type })
            });

            if (!res.ok) throw new Error('Failed');

            // Redirect back to parent task if applicable
            if (parentId) {
                router.push(`/dashboard/projects/${projectId}/tasks/${parentId}`);
            } else {
                router.push(`/dashboard/projects/${projectId}`);
            }
        } catch (error) {
            console.error(error);
            alert('Error creating issue');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-300">
            <div className="mb-6">
                <Link
                    href={parentId ? `/dashboard/projects/${projectId}/tasks/${parentId}` : `/dashboard/projects/${projectId}`}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {parentId ? 'Back to Parent Task' : 'Back to Project'}
                </Link>
                <h1 className="text-2xl font-bold text-white">
                    {isIssue ? 'New Issue' : parentId ? 'New Subtask' : 'New Task'}
                </h1>
                <p className="text-gray-400">
                    {isIssue
                        ? 'Create a new issue tracking item.'
                        : parentId
                            ? 'Create a sub-task for the selected task.'
                            : 'Create a new task or issue for this project.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Title</label>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder={parentId ? "e.g. Update API Endpoint" : "e.g. Implement Login Page"}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full h-48 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm resize-y"
                        placeholder="Add a detailed description (Markdown supported)..."
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                    <Link
                        href={parentId ? `/dashboard/projects/${projectId}/tasks/${parentId}` : `/dashboard/projects/${projectId}`}
                        className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-green-900/20"
                    >
                        <Save className="w-4 h-4" />
                        {submitting ? 'Creating...' : 'Create Issue'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function NewTaskPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading form...</div>}>
                <NewTaskContent />
            </Suspense>
        </DashboardLayout>
    );
}
