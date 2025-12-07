'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';

export default function ChatLayout({ children, sidebar }: { children: React.ReactNode; sidebar?: React.ReactNode }) {
    // In a real app, we might toggle the dashboard sidebar visibility on mobile
    // For now, we reuse the Dashboard sidebar for navigation context

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            {/* Navigation Sidebar (Reused from Dashboard) */}
            <Sidebar />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col pl-64 h-full relative">
                {children}
            </div>

            {/* Right Context Sidebar (Optional/Collapsible) */}
            {sidebar && (
                <div className="w-80 border-l border-white/10 bg-black h-full hidden xl:block">
                    {sidebar}
                </div>
            )}
        </div>
    );
}
