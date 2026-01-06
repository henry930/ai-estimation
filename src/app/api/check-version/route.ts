import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        version: "1.0.1",
        deployTime: "2026-01-06T21:09:00Z",
        message: "This is a fresh route to verify deployment propagation."
    });
}
