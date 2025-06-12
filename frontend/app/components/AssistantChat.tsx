import { AssistantChatMessage } from "@/app/types/assistant";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";

interface AssistantChatProps {
    className: string
    messages: AssistantChatMessage[];
    isStreaming: boolean;
    onSendMessage: (message: string) => void;
}

export default function AssistantChat({ className, messages, isStreaming, onSendMessage }: AssistantChatProps) {
    const [userMessage, setUserMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollDown = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollDown();
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (userMessage.trim()) {
            onSendMessage(userMessage);
            setUserMessage('');
            scrollDown();
        }
    };

    return (
        <div className={'flex flex-col h-screen ' + className}>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col min-h-full justify-end">
                    <div className="space-y-4">
                        {messages && messages.length === 0 && (
                            <div className="w-full flex justify-center mb-4 pointer-events-none">
                                <span className="text-secondary text-center text-base">
                                    Start chatting with the assistant to help you pack!
                                </span>
                            </div>
                        )}
                        {messages && [...messages].map((message, index) => {
                            if (message.content.trim() !== '') {
                                const isUser = message.role === 'user';
                                return (
                                    <div 
                                        key={index}
                                        className={`flex items-start gap-2 ${
                                            isUser ? 'flex-row-reverse' : ''
                                        }`}
                                    >
                                        <div 
                                            className={`${
                                                isUser 
                                                    ? 'bg-primary text-background rounded-2xl rounded-tr-sm' 
                                                    : 'bg-tertiary rounded-2xl rounded-tl-sm'
                                            } p-4 max-w-[80%]`}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                )
                            } else { return null; }
                        })}
                        {isStreaming && (
                            <div className="flex items-start gap-2 max-w-[80%]">
                                <div className="bg-tertiary rounded-2xl p-4 pr-8">
                                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-75" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-tertiary p-4 bg-background">
                <div className="flex items-center gap-2">
                    <input 
                        type='text' 
                        value={userMessage} 
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 bg-tertiary rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                        disabled={isStreaming}
                    />
                    <button 
                        onClick={handleSendMessage} 
                        disabled={isStreaming || !userMessage.trim()}
                        className="w-10 h-10 flex items-center justify-center text-secondary hover:text-secondary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}