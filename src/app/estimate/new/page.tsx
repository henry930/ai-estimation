'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import MessageList, { Message } from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import ContextSidebar from '@/components/chat/ContextSidebar';
import RepoSelection from '@/components/dashboard/RepoSelection';

interface Project {
    id: string;
    name: string;
    githubUrl: string | null;
}

function ChatInterface() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get('projectId');

    const [project, setProject] = useState<Project | null>(null);
    const [showRepoSelection, setShowRepoSelection] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your AI Estimation Architect. \n\nTell me about the project you'd like to build. The more details you provide about features, technologies, and target users, the more accurate my estimation will be.",
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetch(`/api/projects/${projectId}`)
                .then(res => res.json())
                .then(data => setProject(data))
                .catch(err => console.error('Failed to fetch project:', err));
        }
    }, [projectId]);

    const handleProjectCreated = () => {
        if (projectId) {
            fetch(`/api/projects/${projectId}`)
                .then(res => res.json())
                .then(data => setProject(data));
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!projectId) {
            alert('No project ID found. Please start from a project page.');
            return;
        }

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);

        try {
            const response = await fetch('/api/estimate/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requirements: content,
                    projectId: projectId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate estimation');
            }

            const data = await response.json();

            // Format phases for TaskBreakdown visualization
            const formattedPhases: TaskCategory[] = (JSON.parse(data.estimation.tasks) || []).map((phase: any, idx: number) => ({
                id: (idx + 1).toString(),
                title: phase.name,
                tasks: phase.tasks.map((task: any, tIdx: number) => ({
                    id: `${idx}-${tIdx}`,
                    title: task.name,
                    description: task.description,
                    hours: task.hours,
                    completed: false,
                    branch: null
                }))
            }));

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                type: 'estimation',
                data: formattedPhases,
                content: `### Estimation Generated! \n\n${data.summary}\n\n**Total Hours:** ${data.estimation.totalHours}h\n**Recommended Stack:** ${data.recommendedStack.join(', ')}\n\nI've saved this estimation to your project. You can view the details back on the project page.`,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (err: any) {
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            <ChatLayout
                sidebar={
                    <ContextSidebar
                        githubUrl={project?.githubUrl}
                        onConnectRepo={() => setShowRepoSelection(true)}
                    />
                }
            >
                <div className="flex-1 flex flex-col min-h-0">
                    <MessageList messages={messages} />
                    {isThinking && (
                        <div className="px-6 py-4 text-sm text-gray-500 italic">
                            AI is thinking...
                        </div>
                    )}
                    <MessageInput onSend={handleSendMessage} />
                </div>
            </ChatLayout>

            {showRepoSelection && (
                <RepoSelection
                    onProjectCreated={handleProjectCreated}
                    onClose={() => setShowRepoSelection(false)}
                />
            )}
        </>
    );
}

export default function NewEstimationPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-[#050505]">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ChatInterface />
        </Suspense>
    );
}
