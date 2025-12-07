import { prisma } from './prisma';

export const FREE_TIER_LIMIT = 3;

/**
 * Check if a user has sufficient credits to create a new estimation.
 * Counts estimations created in the current calendar month.
 */
export async function checkUsage(userId: string): Promise<boolean> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: 'active',
        },
    });

    // If Pro or Team, assume unlimited for now (or defined limits)
    if (subscription && (subscription.plan === 'pro' || subscription.plan === 'team')) {
        return true;
    }

    // Count estimations created this month
    const currentUsage = await prisma.estimation.count({
        where: {
            project: { // usage is tied to user's projects
                userId: userId
            },
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        },
    });

    return currentUsage < FREE_TIER_LIMIT;
}

/**
 * Deduct credit (or track usage).
 * For now, the creation of the estimation record itself serves as the deduction/tracking.
 * This function can be expanded for more complex credit systems later.
 */
export async function deductCredit(userId: string): Promise<void> {
    // No-op: usage is calculated on-the-fly by counting records.
    // In a token-based system, we would decrement a balance here.
}
