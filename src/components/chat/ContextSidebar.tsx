'use client';

export default function ContextSidebar() {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold px-2">Project Context</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Uploaded Files Section */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">Uploaded Files</h4>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-sm text-gray-300">
                            <DocumentIcon />
                            <span className="truncate">requirements.pdf</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-sm text-gray-300">
                            <DocumentIcon />
                            <span className="truncate">database-schema.png</span>
                        </div>
                    </div>
                </div>

                {/* GitHub Context Section (Placeholder) */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">GitHub Repository</h4>
                    <button className="w-full py-2 px-3 rounded-lg border border-dashed border-white/20 text-sm text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2">
                        <PlusIcon />
                        Connect Repository
                    </button>
                </div>
            </div>
        </div>
    );
}

function DocumentIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    )
}
