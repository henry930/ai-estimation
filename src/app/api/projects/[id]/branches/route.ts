import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getGitHubAccessToken, getProjectBranches } from '@/lib/github';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const project = await prisma.project.findUnique({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (!project.githubUrl) {
            return NextResponse.json({ error: 'Project has no GitHub URL' }, { status: 400 });
        }

        // Extract "owner/repo" from "https://github.com/owner/repo"
        const fullName = project.githubUrl.split('github.com/')[1];

        if (!fullName) {
            return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
        }

        const accessToken = await getGitHubAccessToken(session.user.id);
        if (!accessToken) {
            return NextResponse.json({ error: 'GitHub account not connected' }, { status: 400 });
        }

        const branches = await getProjectBranches(accessToken, fullName);
        return NextResponse.json(branches);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
