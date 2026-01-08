import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string || file.name;
        const category = formData.get('category') as string || 'GENERAL';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const key = `projects/${projectId}/master-mind/${filename}`;

        const url = await uploadToS3(key, buffer, file.type);

        // Find a root task to link it to (project level)
        const rootTask = await prisma.task.findFirst({ where: { projectId, level: 0 } });

        if (rootTask) {
            await prisma.taskDocument.create({
                data: {
                    taskId: rootTask.id,
                    title: title,
                    url: url,
                    type: 'master_mind',
                    // Note: We might want a 'category' or 'metadata' field in the schema eventually
                }
            });
        }

        return NextResponse.json({ success: true, url, title });
    } catch (error: any) {
        console.error('Master Mind Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
