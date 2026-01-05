'use client';

import { useState } from 'react';

// Mock Tree Data
const mockTree = [
    {
        id: 'src',
        name: 'src',
        type: 'folder',
        children: [
            {
                id: 'components', name: 'components', type: 'folder', children: [
                    { id: 'Button.tsx', name: 'Button.tsx', type: 'file' },
                    { id: 'Card.tsx', name: 'Card.tsx', type: 'file' },
                ]
            },
            {
                id: 'app', name: 'app', type: 'folder', children: [
                    { id: 'page.tsx', name: 'page.tsx', type: 'file' },
                    { id: 'layout.tsx', name: 'layout.tsx', type: 'file' },
                ]
            },
        ]
    },
    { id: 'package.json', name: 'package.json', type: 'file' },
    { id: 'README.md', name: 'README.md', type: 'file' },
];

interface TreeNode {
    id: string;
    name: string;
    type: string;
    children?: TreeNode[];
}

export default function FileTree() {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'src': true });
    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        const isFolder = node.type === 'folder';
        const isExpanded = expanded[node.id];
        const isSelected = selected[node.id];

        return (
            <div key={node.id}>
                <div
                    className="flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                >
                    {/* Checkbox */}
                    <button
                        onClick={() => toggleSelect(node.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-600 hover:border-gray-400'}`}
                    >
                        {isSelected && <CheckIconSmall />}
                    </button>

                    {/* Icon & Name */}
                    <div
                        className="flex items-center gap-2 flex-1"
                        onClick={() => isFolder ? toggleExpand(node.id) : toggleSelect(node.id)}
                    >
                        {isFolder ? (
                            <FolderIcon open={isExpanded} />
                        ) : (
                            <FileIcon />
                        )}
                        <span className="text-sm text-gray-300 select-none">{node.name}</span>
                    </div>
                </div>

                {isFolder && isExpanded && node.children && (
                    <div>
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden p-4 min-h-[300px]">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">Repository Files</h3>
            <div className="space-y-0.5">
                {mockTree.map(node => renderNode(node))}
            </div>
        </div>
    );
}

function CheckIconSmall() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
        </svg>
    )
}

function FolderIcon({ open }: { open?: boolean }) {
    return open ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
        </svg>
    )
}

function FileIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
            <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z" clipRule="evenodd" />
            <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
        </svg>
    )
}
