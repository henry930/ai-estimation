'use client';

import { XIcon } from 'lucide-react';
import RepoSelector from '@/components/github/RepoSelector';

interface RepoSelectionProps {
    onProjectCreated: () => void;
    onClose: () => void;
}

export default function RepoSelection({ onProjectCreated, onClose }: RepoSelectionProps) {
    const handleSelectRepo = async (fullName: string) => {
        try {
            const res = await fetch('/api/projects/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoFullName: fullName })
            });
            const data = await res.json();
            if (data.success) {
                console.log('Project created/synced:', data.data.project.id);
                onProjectCreated();
                // Redirect to the new project
                window.location.href = `/dashboard/projects/${data.data.project.id}`;
            } else {
                alert(data.error || 'Failed to sync project');
            }
        } catch (err) {
            console.error('Failed to sync repo:', err);
            alert('Failed to connect to sync API');
        } finally {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white">Select Repository</h2>
                        <p className="text-sm text-gray-400 mt-1">Choose a GitHub repository to start your estimation</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <RepoSelector onSelect={handleSelectRepo} />
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
