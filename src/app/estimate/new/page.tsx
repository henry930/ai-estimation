'use client';

import { useState } from 'react';
import ChatLayout from '@/components/chat/ChatLayout';
import MessageList, { Message } from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import ContextSidebar from '@/components/chat/ContextSidebar';

export default function NewEstimationPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your AI Estimation Architect. \n\nTell me about the project you'd like to build. The more details you provide about features, technologies, and target users, the more accurate my estimation will be.",
            timestamp: new Date()
        }
    ]);

    const handleSendMessage = (content: string) => {
        // Add user message
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);

        // Simulate AI thinking and response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I've received your requirements. I'm analyzing the scope...",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    return (
        <ChatLayout sidebar={<ContextSidebar />}>
            <MessageList messages={messages} />
            <MessageInput onSend={handleSendMessage} />
        </ChatLayout>
    );
}
