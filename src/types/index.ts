// Type definitions for AI Estimation System

export interface User {
    id: string
    email: string
    name: string | null
    createdAt: Date
}

export interface Subscription {
    id: string
    userId: string
    plan: 'free' | 'pro' | 'team'
    status: 'active' | 'cancelled' | 'expired'
    startDate: Date
    endDate: Date | null
}

export interface Project {
    id: string
    userId: string
    name: string
    description: string | null
    githubUrl: string | null
    createdAt: Date
}

export interface Task {
    name: string
    description?: string
    hours: number
    status?: 'pending' | 'in-progress' | 'completed'
}

export interface TaskPhase {
    name: string
    hours: number
    tasks: Task[]
}

export interface Estimation {
    id: string
    projectId: string
    tasks: {
        phases: TaskPhase[]
    }
    totalHours: number
    minHours: number | null
    maxHours: number | null
    status: 'draft' | 'confirmed' | 'completed'
    createdAt: Date
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: Date
}

export interface ChatHistory {
    id: string
    projectId: string
    messages: ChatMessage[]
    context?: Record<string, any>
    createdAt: Date
}

// API Response types
export interface ApiResponse<T> {
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
}
