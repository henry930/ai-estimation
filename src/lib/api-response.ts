import { NextResponse } from 'next/server';

type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
};

export function successResponse<T>(data: T, status = 200) {
    const body: ApiResponse<T> = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body, { status });
}

export function errorResponse(message: string, status = 500) {
    const body: ApiResponse<null> = {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body, { status });
}
