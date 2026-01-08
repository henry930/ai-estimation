'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewTaskPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

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
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error('Failed');

            router.push(`/dashboard/projects/${projectId}`);
        } catch (error) {
            console.error(error);
            alert('Error creating issue');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-300">
                <div className="mb-6">
                    <Link href={`/dashboard/projects/${projectId}`} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Project
                    </Link>
                    <h1 className="text-2xl font-bold text-white">New Issue</h1>
                    <p className="text-gray-400">Create a new task or issue for this project.</p>
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
                            placeholder="e.g. Implement Login Page"
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
                        <Link href={`/dashboard/projects/${projectId}`} className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">
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
        </DashboardLayout>
    );
}
