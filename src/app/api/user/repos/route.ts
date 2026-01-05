import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGitHubAccessToken, getUserRepositories } from '@/lib/github';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const accessToken = await getGitHubAccessToken(session.user.id);

        if (!accessToken) {
            return NextResponse.json({ error: 'GitHub account not connected' }, { status: 400 });
        }

        const repos = await getUserRepositories(accessToken);
        return NextResponse.json(repos);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
