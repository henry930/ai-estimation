import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
    try {
        // Determine database availability by running a simple query
        await prisma.$queryRaw`SELECT 1`;

        return successResponse({
            status: 'healthy',
            service: 'database',
            latency: 'ok' // In real scenario, we could measure execution time
        });
    } catch (error) {
        console.error('Database Connectivity Error:', error);
        return errorResponse('Database connection failed', 503);
    }
}
