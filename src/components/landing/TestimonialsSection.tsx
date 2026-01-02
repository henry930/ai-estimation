export default function TestimonialsSection() {
    const testimonials = [
        {
            quote: "This AI tool has completely revolutionized our estimation process. What used to take days now takes minutes.",
            author: "Sarah Chen",
            role: "Product Manager at TechFlow",
            avatar: "SC"
        },
        {
            quote: "The GitHub integration is a game-changer. It doesn't just estimate; it actually sets up the project structure for us.",
            author: "Marcus Rodriguez",
            role: "Senior Full-stack Developer",
            avatar: "MR"
        },
        {
            quote: "The precision of the man-hour breakdown is uncanny. It's consistently within 10% of our actual development time.",
            author: "Elena Petrova",
            role: "CTO at StartupX",
            avatar: "EP"
        }
    ];

    return (
        <section id="testimonials" className="py-24 bg-black text-white relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Trusted by developers.</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg underline decoration-blue-500/30 underline-offset-8">
                        Join hundreds of teams using AI to build projects faster and with more confidence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
                            <p className="text-lg text-gray-300 italic mb-8 leading-relaxed">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{testimonial.author}</h4>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
