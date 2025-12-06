import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Welcome back, {session.user?.name || session.user?.email}!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">Projects</h3>
                        <p className="text-3xl font-bold text-blue-600">0</p>
                        <p className="text-sm text-gray-500 mt-2">Total projects</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">Estimations</h3>
                        <p className="text-3xl font-bold text-purple-600">0</p>
                        <p className="text-sm text-gray-500 mt-2">This month</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">Subscription</h3>
                        <p className="text-lg font-semibold text-green-600">Free</p>
                        <p className="text-sm text-gray-500 mt-2">3/3 estimations remaining</p>
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                            <span className="font-medium text-blue-900">+ New Estimation</span>
                            <p className="text-sm text-blue-600">Start a new project estimation</p>
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                            <span className="font-medium text-purple-900">Connect GitHub</span>
                            <p className="text-sm text-purple-600">Link your GitHub account</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
