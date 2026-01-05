import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
    title: 'AI Estimation System | Precision Project Planning',
    description: 'AI-powered project estimation with GitHub integration. Transform ideas into detailed plans in minutes.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-sans antialiased text-white bg-black">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
