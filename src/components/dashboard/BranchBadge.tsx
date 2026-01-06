'use client';

import { useState } from 'react';
import { GitBranch, GitMerge, GitCommit, AlertCircle } from 'lucide-react';

interface BranchInfo {
    name: string;
    status?: 'merged' | 'ahead' | 'behind' | 'synced';
    commitsAhead?: number;
    commitsBehind?: number;
    lastCommit?: string;
    githubUrl?: string;
}

interface BranchBadgeProps {
    branch: string;
    githubRepoUrl?: string;
    size?: 'sm' | 'md';
    onClick?: () => void;
}

export default function BranchBadge({ branch, githubRepoUrl, size = 'md', onClick }: BranchBadgeProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
    const [loading, setLoading] = useState(false);

    // Extract owner and repo from GitHub URL
    const getGitHubBranchUrl = () => {
        if (!githubRepoUrl) return null;
        const match = githubRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return null;
        const [_, owner, repo] = match;
        return `https://github.com/${owner}/${repo.replace('.git', '')}/tree/${branch}`;
    };

    const fetchBranchInfo = async () => {
        if (branchInfo || loading || !githubRepoUrl) return;

        setLoading(true);
        try {
            const match = githubRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match) return;

            const [_, owner, repo] = match;
            const response = await fetch(`/api/github/branches/${branch}?owner=${owner}&repo=${repo.replace('.git', '')}`);

            if (response.ok) {
                const data = await response.json();
                setBranchInfo(data);
            }
        } catch (error) {
            console.error('Failed to fetch branch info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMouseEnter = () => {
        setShowTooltip(true);
        fetchBranchInfo();
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = getGitHubBranchUrl();
        if (url) {
            window.open(url, '_blank');
        }
        onClick?.();
    };

    const sizeClasses = {
        sm: 'text-[10px] px-1.5 py-0.5 gap-1',
        md: 'text-xs px-2 py-1 gap-1.5',
    };

    const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

    return (
        <div className="relative inline-block">
            <button
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
                className={`inline-flex items-center ${sizeClasses[size]} bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-all font-mono cursor-pointer`}
            >
                <GitBranch className={iconSize} />
                <span className="max-w-[120px] truncate">{branch}</span>
            </button>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-white/20 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-2">
                        {/* Branch Name */}
                        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                            <GitBranch className="w-4 h-4 text-blue-400" />
                            <span className="font-mono text-sm text-white font-semibold">{branch}</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : branchInfo ? (
                            <>
                                {/* Status */}
                                {branchInfo.status && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">Status:</span>
                                        <span className={`px-2 py-0.5 rounded-full font-medium ${branchInfo.status === 'merged' ? 'bg-purple-500/20 text-purple-300' :
                                                branchInfo.status === 'synced' ? 'bg-green-500/20 text-green-300' :
                                                    branchInfo.status === 'ahead' ? 'bg-blue-500/20 text-blue-300' :
                                                        'bg-orange-500/20 text-orange-300'
                                            }`}>
                                            {branchInfo.status === 'merged' && <><GitMerge className="w-3 h-3 inline mr-1" />Merged</>}
                                            {branchInfo.status === 'synced' && 'Up to date'}
                                            {branchInfo.status === 'ahead' && `${branchInfo.commitsAhead} ahead`}
                                            {branchInfo.status === 'behind' && <><AlertCircle className="w-3 h-3 inline mr-1" />{branchInfo.commitsBehind} behind</>}
                                        </span>
                                    </div>
                                )}

                                {/* Commits */}
                                {(branchInfo.commitsAhead !== undefined || branchInfo.commitsBehind !== undefined) && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">Commits:</span>
                                        <div className="flex items-center gap-2">
                                            {branchInfo.commitsAhead !== undefined && branchInfo.commitsAhead > 0 && (
                                                <span className="text-green-400 font-mono">↑{branchInfo.commitsAhead}</span>
                                            )}
                                            {branchInfo.commitsBehind !== undefined && branchInfo.commitsBehind > 0 && (
                                                <span className="text-orange-400 font-mono">↓{branchInfo.commitsBehind}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Last Commit */}
                                {branchInfo.lastCommit && (
                                    <div className="flex items-center gap-2 text-xs pt-2 border-t border-white/10">
                                        <GitCommit className="w-3 h-3 text-gray-400" />
                                        <span className="text-gray-400 truncate">{branchInfo.lastCommit}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-xs text-gray-400 text-center py-2">
                                Click to view on GitHub
                            </div>
                        )}

                        {/* GitHub Link */}
                        {getGitHubBranchUrl() && (
                            <div className="pt-2 border-t border-white/10">
                                <a
                                    href={getGitHubBranchUrl()!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    View on GitHub
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                        <div className="w-2 h-2 bg-gray-900 border-r border-b border-white/20 transform rotate-45" />
                    </div>
                </div>
            )}
        </div>
    );
}
