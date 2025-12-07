import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white pt-16">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/40 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/30 rounded-full blur-[128px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-gray-300">
                    AI-Powered Project Estimation
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                    Estimate projects <br />
                    <span className="text-white">with precision.</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                    Transform vague ideas into detailed project plans, cost estimates, and GitHub repositories in minutes using advanced AI.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/estimate/new"
                        className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
                    >
                        Start Estimation
                    </Link>
                    <Link
                        href="#how-it-works"
                        className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-all text-lg font-medium backdrop-blur-sm"
                    >
                        How it works
                    </Link>
                </div>

                {/* Floating UI Elements Mockup (Visual Interest) */}
                <div className="mt-20 relative mx-auto max-w-5xl rounded-t-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2 overflow-hidden shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/40">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div className="ml-4 w-60 h-2 bg-white/10 rounded-full" />
                    </div>
                    <div className="p-8 aspect-video bg-black/60 flex items-center justify-center text-gray-500 relative">
                        <div className="absolute inset-0 grid grid-cols-6 gap-4 p-4 opacity-20">
                            <div className="col-span-2 h-32 bg-white/20 rounded-lg"></div>
                            <div className="col-span-4 h-32 bg-white/10 rounded-lg"></div>
                            <div className="col-span-3 h-32 bg-white/10 rounded-lg"></div>
                            <div className="col-span-3 h-32 bg-white/20 rounded-lg"></div>
                        </div>
                        <span className="text-2xl font-light tracking-widest uppercase opacity-50 relative z-10">AI Analysis Dashboard</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
