import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Next.js 15 params
) {
    const { id } = await params;

    try {
        const estimation = await prisma.estimation.findUnique({
            where: { id },
            include: { project: true }
        });

        if (!estimation) {
            return errorResponse('Estimation not found', 404);
        }

        const parsedEstimation = {
            ...estimation,
            tasks: JSON.parse(estimation.tasks)
        };

        return successResponse(parsedEstimation);
    } catch (error) {
        console.error('Get Estimation Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { status } = body;

        const updated = await prisma.estimation.update({
            where: { id },
            data: { status }
        });

        return successResponse(updated);
    } catch (error) {
        console.error('Update Estimation Error:', error);
        return errorResponse('Failed to update estimation', 500);
    }
}
