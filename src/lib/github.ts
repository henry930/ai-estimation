import { Octokit } from '@octokit/rest';

export const getOctokit = (token?: string) => {
    if (!token) {
        console.warn('No GitHub token provided. Usage might rely on Mock Data.');
        return null;
    }

    return new Octokit({
        auth: token,
    });
};

export const mockRepos = [
    {
        id: 1,
        name: 'ai-estimation',
        full_name: 'henry930/ai-estimation',
        private: true,
        description: 'AI-powered project estimation tool',
        html_url: 'https://github.com/henry930/ai-estimation',
        language: 'TypeScript',
        updated_at: new Date().toISOString(),
    },
    {
        id: 2,
        name: 'portfolio-v2',
        full_name: 'henry930/portfolio-v2',
        private: false,
        description: 'Personal portfolio website',
        html_url: 'https://github.com/henry930/portfolio-v2',
        language: 'JavaScript',
        updated_at: new Date(Date.now() - 86400000).toISOString(),
    }
];

export const mockFileTree = [
    { path: 'package.json', type: 'blob', sha: 'abc1' },
    { path: 'tsconfig.json', type: 'blob', sha: 'abc2' },
    { path: 'src', type: 'tree', sha: 'abc3' },
    { path: 'src/app', type: 'tree', sha: 'abc4' },
    { path: 'src/app/page.tsx', type: 'blob', sha: 'abc5' },
];

export const createIssue = async (octokit: Octokit, owner: string, repo: string, title: string, body: string, labels: string[] = []) => {
    try {
        const { data } = await octokit.issues.create({
            owner,
            repo,
            title,
            body,
            labels
        });
        return data;
    } catch (error) {
        console.error('Error creating issue:', error);
        throw error;
    }
};
