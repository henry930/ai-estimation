'use client';

import { useState, useRef } from 'react';

export default function MessageInput({ onSend }: { onSend: (content: string) => void }) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        onSend(input);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const resizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    }

    return (
        <div className="p-6 border-t border-white/10 bg-[#050505]">
            <div className="max-w-4xl mx-auto relative flex items-end gap-3 p-3 bg-[#111] rounded-xl border border-white/10 focus-within:border-white/20 transition-colors shadow-lg shadow-black/50">

                {/* Attachment Button */}
                <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    <PaperClipIcon />
                </button>

                {/* Text Input */}
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={resizeTextarea}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your project requirements..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none max-h-[200px] py-2.5"
                    rows={1}
                    style={{ minHeight: '44px' }}
                />

                {/* Send Button */}
                <button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowUpIcon />
                </button>
            </div>
            <div className="text-center mt-3 text-xs text-gray-600">
                AI can make mistakes. Please verify important information.
            </div>
        </div>
    );
}

function PaperClipIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
        </svg>
    )
}

function ArrowUpIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
    )
}
