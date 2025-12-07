import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 py-12 text-white/60 text-sm">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">AI</div>
                        <span className="font-semibold text-white">AI Estimation</span>
                    </div>

                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                    </div>

                    <div className="text-center md:text-right">
                        &copy; {new Date().getFullYear()} AI Estimation. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
