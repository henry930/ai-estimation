import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import Footer from '@/components/layout/Footer';

export default async function Home() {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    // Redirect authenticated users to dashboard
    if (session) {
        redirect('/dashboard');
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white">
            <HeroSection />
            <FeaturesSection />
            <PricingSection />
            <TestimonialsSection />
            <Footer />
        </main>
    );
}
