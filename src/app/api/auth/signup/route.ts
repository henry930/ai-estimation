import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = signupSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const passwordHash = await bcrypt.hash(validatedData.password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                name: validatedData.name,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            }
        })

        return NextResponse.json(
            { user, message: 'User created successfully' },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
