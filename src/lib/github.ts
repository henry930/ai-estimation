import { prisma } from './prisma';
import { Octokit } from '@octokit/rest';

/**
 * Creates an Octokit instance with the provided access token
 * Returns null if no token is provided (for mock mode)
 */
export function getOctokit(token?: string | null): Octokit | null {
    if (!token) return null;
    return new Octokit({ auth: token });
}

/**
 * Creates a GitHub issue using Octokit
 */
export async function createIssue(
    octokit: Octokit,
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels?: string[]
) {
    return await octokit.issues.create({
        owner,
        repo,
        title,
        body,
        labels
    });
}

/**
 * Mock file tree data for development/testing
 */
export const mockFileTree = [
    { path: 'README.md', type: 'blob', size: 1234 },
    { path: 'src/index.ts', type: 'blob', size: 567 },
    { path: 'src/lib', type: 'tree' },
    { path: 'src/lib/utils.ts', type: 'blob', size: 890 },
    { path: 'package.json', type: 'blob', size: 2345 },
];


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
