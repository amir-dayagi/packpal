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

// Presentational component: renders the list of chat messages and streaming indicator.
function ChatMessageList({
    messages,
    isStreaming,
    messagesEndRef,
}: {
    messages: AssistantChatMessage[];
    isStreaming: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
            <div className="flex flex-col min-h-full justify-end">
                <div className="space-y-4">
                    {messages && messages.length === 0 && (
                        <div className="w-full flex justify-center mb-4 pointer-events-none">
                            <span className="text-secondary text-center text-sm">
                                Start chatting with PackPal to refine your trip and packing list.
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
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                            isUser 
                                                ? 'bg-primary text-white' 
                                                : 'bg-tertiary text-secondary'
                                        }`}>
                                            {isUser ? 'You' : 'AI'}
                                        </div>
                                    </div>

                                    {/* Bubble */}
                                    <div 
                                        className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-sm ${
                                            isUser 
                                                ? 'bg-primary text-background rounded-tr-sm' 
                                                : 'bg-tertiary rounded-tl-sm'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                                    </div>
                                </div>
                            )
                        } else { return null; }
                    })}
                    {isStreaming && (
                        <div className="flex items-start gap-2 max-w-[80%]">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-tertiary text-secondary">
                                    AI
                                </div>
                            </div>
                            <div className="bg-tertiary rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    <span className="w-2 h-2 bg-primary/70 rounded-full animate-pulse delay-150" />
                                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-pulse delay-300" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
}

// Presentational component: renders the chat input area and send button.
function ChatInput({
    userMessage,
    isStreaming,
    onChange,
    onKeyDown,
    onSend,
}: {
    userMessage: string;
    isStreaming: boolean;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSend: () => void;
}) {
    return (
        <div className="shrink-0 border-t border-tertiary px-4 py-3 bg-background/95">
            <div className="flex items-center gap-2">
                <input 
                    type='text' 
                    value={userMessage} 
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask PackPal to add, adjust, or remove items..."
                    className="flex-1 bg-tertiary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    disabled={isStreaming}
                />
                <button 
                    onClick={onSend} 
                    disabled={isStreaming || !userMessage.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-secondary hover:text-foreground hover:bg-tertiary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default function AssistantChat({ className, messages, isStreaming, onSendMessage }: AssistantChatProps) {
    const [userMessage, setUserMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
        <div className={`flex flex-col ${className}`}>
            {/* Chat messages */}
            <ChatMessageList
                messages={messages}
                isStreaming={isStreaming}
                messagesEndRef={messagesEndRef}
            />

            {/* Input area */}
            <ChatInput
                userMessage={userMessage}
                isStreaming={isStreaming}
                onChange={setUserMessage}
                onKeyDown={handleKeyDown}
                onSend={handleSendMessage}
            />
        </div>
    );
}