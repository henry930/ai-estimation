import { prisma } from './prisma';

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    updated_at: string;
}

export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected: boolean;
}

export async function getGitHubAccessToken(userId: string): Promise<string | null> {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: 'github',
        },
    });

    return account?.access_token || null;
}

export async function getUserRepositories(accessToken: string): Promise<GitHubRepo[]> {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch repositories from GitHub');
    }

    return response.json();
}

export async function getProjectBranches(accessToken: string, fullName: string): Promise<GitHubBranch[]> {
    const response = await fetch(`https://api.github.com/repos/${fullName}/branches`, {
        headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch branches from GitHub');
    }

    return response.json();
}
