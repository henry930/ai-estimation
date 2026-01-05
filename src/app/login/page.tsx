import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage() {
    // Check if user is already authenticated
    const session = await getServerSession(authOptions);

    // Redirect authenticated users to dashboard
    if (session) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Sign in to continue to AI Estimation
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    )
}
