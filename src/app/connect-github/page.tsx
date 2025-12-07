'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ConnectButton from '@/components/github/ConnectButton';
import RepoSelector from '@/components/github/RepoSelector';
import FileTree from '@/components/github/FileTree';
import Link from 'next/link';

export default function ConnectGitHubPage() {
    const [isConnected, setIsConnected] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState<number | null>(null);

    // Mock auto-connection effect for demo purposes (or could use a toggle)
    const toggleConnection = () => {
        setIsConnected(!isConnected);
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Connect Codebase</h1>
                    <p className="text-gray-400">Give the AI access to your repository to generate more accurate estimations.</p>
                </div>

                {/* 1. Connection Step */}
                <div className={`p-8 rounded-2xl border ${isConnected ? 'bg-[#111] border-green-500/20' : 'bg-[#111] border-white/10'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">GitHub Integration</h2>
                            <p className="text-sm text-gray-500">
                                {isConnected ? 'Connected to henry930' : 'Connect your account to browse repositories'}
                            </p>
                        </div>

                        {!isConnected ? (
                            <div onClick={toggleConnection}>
                                <ConnectButton />
                            </div>
                        ) : (
                            <button onClick={toggleConnection} className="text-sm text-red-400 hover:text-red-300">
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Repository Selection (Only visible if connected) */}
                {isConnected && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-medium text-lg">Select Repository</h3>
                                <RepoSelector onSelect={setSelectedRepo} />
                            </div>

                            <div className={`space-y-4 transition-opacity ${selectedRepo ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <h3 className="font-medium text-lg">Select Context Files</h3>
                                <FileTree />
                            </div>
                        </div>

                        {selectedRepo && (
                            <div className="flex justify-end pt-8 border-t border-white/10">
                                <Link
                                    href="/estimate/new"
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Continue to Estimation →
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
