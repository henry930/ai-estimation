'use client';

import { useState, useEffect } from 'react';
import { GitHubRepo } from '@/lib/github';
import { Button } from '../Button';

interface RepoSelectionProps {
    onProjectCreated: () => void;
    onClose: () => void;
}

export default function RepoSelection({ onProjectCreated, onClose }: RepoSelectionProps) {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState<number | null>(null);

    useEffect(() => {
        fetchRepos();
    }, []);

    const fetchRepos = async () => {
        try {
            const response = await fetch('/api/user/repos');
            if (!response.ok) throw new Error('Failed to fetch repositories');
            const data = await response.json();
            setRepos(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (repo: GitHubRepo) => {
        setCreating(repo.id);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: repo.name,
                    githubUrl: repo.html_url,
                    githubRepoId: repo.id,
                    description: repo.description,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create project');
            }

            onProjectCreated();
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(null);
        }
    };

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Select GitHub Repository</h2>
                        <p className="text-sm text-gray-400 mt-1">Choose a repository to start an estimation</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-4 border-b border-white/10">
                    <input
                        type="text"
                        placeholder="Search repositories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">Fetching your repositories...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-400">{error}</p>
                            <Button onClick={fetchRepos} variant="outline" className="mt-4">Retry</Button>
                        </div>
                    ) : filteredRepos.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No repositories found.
                        </div>
                    ) : (
                        filteredRepos.map(repo => (
                            <button
                                key={repo.id}
                                onClick={() => handleSelect(repo)}
                                disabled={creating !== null}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all text-left group"
                            >
                                <div>
                                    <div className="font-medium group-hover:text-blue-400 transition-colors">{repo.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{repo.full_name}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {repo.language && (
                                        <span className="text-xs text-gray-400 px-2 py-1 rounded bg-white/5">{repo.language}</span>
                                    )}
                                    {creating === repo.id ? (
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ChevronRightIcon />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
    );
}
