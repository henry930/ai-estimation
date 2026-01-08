import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Page Not Found
            </h2>
            <p className="text-gray-400 mb-8">Could not find the requested resource.</p>
            <Link
                href="/dashboard"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
                Return to Dashboard
            </Link>
        </div>
    )
}
