'use client';

import { useState, useEffect } from 'react';

interface Repo {
    id: number;
    name: string;
    private: boolean;
    updated: string;
    html_url: string;
}

export default function RepoSelector({ onSelect }: { onSelect: (fullName: string) => void }) {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<number | null>(null);
    const [mode, setMode] = useState<'select' | 'create'>('select');
    const [newRepoName, setNewRepoName] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [creating, setCreating] = useState(false);

    const handleCreateRepo = async () => {
        if (!newRepoName) return;
        setCreating(true);
        try {
            const res = await fetch('/api/github/repos/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoName: newRepoName,
                    isPrivate,
                    description: `Project repository for ${newRepoName}`
                })
            });
            const data = await res.json();
            if (data.success) {
                onSelect(data.data.repoUrl.split('github.com/')[1]);
            } else {
                alert(data.error || 'Failed to create repository');
            }
        } catch (err) {
            alert('Error creating repository');
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const res = await fetch('/api/github/repos');
                const data = await res.json();
                if (data.success) {
                    setRepos(data.data);
                } else {
                    setError(data.error || 'Failed to fetch repositories');
                }
            } catch (err) {
                setError('Failed to connect to GitHub API');
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, []);

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (id: number, fullName: string) => {
        setSelected(id);
        onSelect(fullName);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-400 text-sm bg-red-500/5 rounded-xl border border-red-500/10">
                {error}
                <button
                    onClick={() => window.location.reload()}
                    className="block mx-auto mt-4 text-white hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
            {/* Mode Toggle */}
            <div className="flex border-b border-white/10 bg-white/5 p-1 gap-1">
                <button
                    onClick={() => setMode('select')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'select' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                    SELECT REPO
                </button>
                <button
                    onClick={() => setMode('create')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                    CREATE NEW
                </button>
            </div>

            {mode === 'select' ? (
                <>
                    <div className="p-4 border-b border-white/10">
                        <input
                            type="text"
                            placeholder="Search repositories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {filteredRepos.map(repo => (
                            <button
                                key={repo.id}
                                onClick={() => handleSelect(repo.id, repo.html_url.split('github.com/')[1])}
                                className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-l-4 ${selected === repo.id ? 'bg-white/5 border-blue-500' : 'border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <RepoIcon isPrivate={repo.private} />
                                    <div className="text-left">
                                        <div className="font-medium text-white text-sm">{repo.name}</div>
                                        <div className="text-xs text-gray-500">Updated {repo.updated}</div>
                                    </div>
                                </div>
                                {selected === repo.id && (
                                    <CheckIcon />
                                )}
                            </button>
                        ))}
                        {filteredRepos.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No repositories found.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Repo Name</label>
                        <input
                            type="text"
                            placeholder="e.g. my-awesome-project"
                            value={newRepoName}
                            onChange={(e) => setNewRepoName(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                            <div className="text-sm font-medium text-white">Private Repository</div>
                            <div className="text-xs text-gray-500">Only you and authorized users can see this repo</div>
                        </div>
                        <button
                            onClick={() => setIsPrivate(!isPrivate)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-blue-600' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPrivate ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    <button
                        onClick={handleCreateRepo}
                        disabled={creating || !newRepoName}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/40"
                    >
                        {creating ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Initializing...
                            </div>
                        ) : 'Create & Connect Repository'}
                    </button>
                </div>
            )}
        </div>
    );
}

function RepoIcon({ isPrivate }: { isPrivate: boolean }) {
    return isPrivate ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500/80">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
            <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
        </svg>
    )
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    )
}
