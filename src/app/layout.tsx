import type { Metadata } from 'next'
import './globals.css'

import Providers from '@/components/Providers'

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
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
