import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import Footer from '@/components/layout/Footer';

export default function Home() {
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
