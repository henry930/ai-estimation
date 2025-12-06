import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'AI Estimation System',
    description: 'AI-powered project estimation with GitHub integration',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
