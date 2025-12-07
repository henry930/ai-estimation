'use client';

import { useState } from 'react';

// Mock Data
const mockRepos = [
    { id: 1, name: 'ai-estimation', private: true, updated: '2 hours ago' },
    { id: 2, name: 'nextjs-starter', private: false, updated: '1 day ago' },
    { id: 3, name: 'finance-dashboard', private: true, updated: '5 days ago' },
    { id: 4, name: 'portfolio-v2', private: false, updated: '1 week ago' },
];

export default function RepoSelector({ onSelect }: { onSelect: (repoId: number) => void }) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<number | null>(null);

    const filteredRepos = mockRepos.filter(repo =>
        repo.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (id: number) => {
        setSelected(id);
        onSelect(id);
    };

    return (
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
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
                        onClick={() => handleSelect(repo.id)}
                        className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-l-4 ${selected === repo.id ? 'bg-white/5 border-blue-500' : 'border-transparent'}`}
                    >
                        <div className="flex items-center gap-3">
                            <RepoIcon isPrivate={repo.private} />
                            <div className="text-left">
                                <div className="font-medium text-white">{repo.name}</div>
                                <div className="text-xs text-gray-500">{repo.updated}</div>
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
