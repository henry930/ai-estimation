'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { PanelRightIcon, MenuIcon } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    rightSidebar?: React.ReactNode;
}

export default function DashboardLayout({ children, rightSidebar }: DashboardLayoutProps) {
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Left Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col pl-64">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 sticky top-0 bg-black/80 backdrop-blur-md z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-medium text-gray-400 capitalize">Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        {rightSidebar && (
                            <button
                                onClick={() => setShowRightSidebar(!showRightSidebar)}
                                className={`p-2 rounded-lg transition-all ${showRightSidebar ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                title={showRightSidebar ? "Hide sidebar" : "Show sidebar"}
                            >
                                <PanelRightIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <main className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${showRightSidebar && rightSidebar ? 'mr-0' : ''}`}>
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>

                    {/* Right Sidebar */}
                    {rightSidebar && (
                        <aside
                            className={`w-80 border-l border-white/10 bg-[#050505] overflow-y-auto transition-all duration-300 fixed right-0 top-16 bottom-0 z-30 ${showRightSidebar ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
                            <div className="p-6 space-y-8">
                                {rightSidebar}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}
