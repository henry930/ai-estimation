import { NextResponse } from 'next/server'

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export function handleApiError(error: unknown) {
    console.error('API Error:', error)

    if (error instanceof ApiError) {
        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.statusCode }
        )
    }

    if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
    )
}

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json({ data }, { status })
}
