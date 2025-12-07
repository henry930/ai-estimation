
export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-[#050505] text-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing.</h2>
                    <p className="text-gray-400">Choose the plan that fits your needs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Tier */}
                    <div className="p-8 rounded-3xl border border-white/10 bg-black flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xl font-medium text-gray-400">Starter</h3>
                            <div className="text-4xl font-bold mt-2">Free</div>
                            <p className="text-sm text-gray-500 mt-1">Forever free for hobbyists.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <CheckIcon />
                                3 estimations / month
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <CheckIcon />
                                Basic PDF Export
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <CheckIcon />
                                Community Support
                            </li>
                        </ul>
                        <button className="w-full py-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all font-medium">
                            Get Started
                        </button>
                    </div>

                    {/* Pro Tier (Highlighted) */}
                    <div className="p-8 rounded-3xl border border-white/20 bg-white/5 relative flex flex-col transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-3xl" />
                        <div className="mb-4">
                            <h3 className="text-xl font-medium text-white">Pro</h3>
                            <div className="text-4xl font-bold mt-2">$29<span className="text-lg font-normal text-gray-500">/mo</span></div>
                            <p className="text-sm text-gray-500 mt-1">For professional developers.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-white">
                                <CheckIcon className="text-blue-400" />
                                Unlimited estimations
                            </li>
                            <li className="flex items-center gap-3 text-sm text-white">
                                <CheckIcon className="text-blue-400" />
                                GitHub Integration (Repos & Issues)
                            </li>
                            <li className="flex items-center gap-3 text-sm text-white">
                                <CheckIcon className="text-blue-400" />
                                Advanced Export Options
                            </li>
                            <li className="flex items-center gap-3 text-sm text-white">
                                <CheckIcon className="text-blue-400" />
                                Priority Support
                            </li>
                        </ul>
                        <button className="w-full py-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-bold">
                            Upgrade to Pro
                        </button>
                    </div>

                    {/* Team Tier */}
                    <div className="p-8 rounded-3xl border border-white/10 bg-black flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xl font-medium text-gray-400">Team</h3>
                            <div className="text-4xl font-bold mt-2">$99<span className="text-lg font-normal text-gray-500">/mo</span></div>
                            <p className="text-sm text-gray-500 mt-1">For agencies and teams.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <CheckIcon />
                                Everything in Pro
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <CheckIcon />
                                Unlimited Team Members
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <CheckIcon />
                                Shared Projects
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <CheckIcon />
                                Dedicated Account Manager
                            </li>
                        </ul>
                        <button className="w-full py-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all font-medium">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CheckIcon({ className = "text-gray-500" }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${className}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    );
}
