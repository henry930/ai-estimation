import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:password@localhost:5432/ai_estimation_local?schema=public"
        }
    }
});

async function main() {
    try {
        await prisma.$connect();
        console.log("Successfully connected to the database!");
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
