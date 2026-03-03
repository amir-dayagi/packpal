import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSparkles, IconSend } from "@tabler/icons-react"
import { useState, useRef, useEffect } from "react"
import { AssistantMessage } from "@/types/assistant"
import { Spinner } from "../ui/spinner"

interface AssistantChatCardProps {
    messages: AssistantMessage[]
    isThinking: boolean
    onChat: (userMsg: string) => void
}

export function AssistantChatCard({ messages, isThinking, onChat }: AssistantChatCardProps) {
    const [input, setInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const handleSend = () => {
        if (isThinking) {
            return
        }
        if (input.trim() === "") {
            return
        }
        onChat(input.trim())
        setInput("")
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <Card className="flex flex-col flex-1">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <IconSparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg">PackPal Assistant</CardTitle>
                            <p className="text-xs text-muted-foreground">Powered by AI</p>
                        </div>
                        {isThinking && <Spinner className="size-6" data-icon="inline-start" />}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((message, index) => (message.content !== "" &&
                            <div
                                key={index}
                                className={`flex ${message.type === "human" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-4 ${message.type === "human"
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-muted text-foreground rounded-bl-none"
                                        }`}
                                >
                                    <p className="text-md whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        {(messages.length === 0 || (isThinking && messages[messages.length - 1].content === "")) && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-2xl rounded-bl-0 flex items-center gap-1.5 px-4 py-4">
                                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Input area */}
                <div className="p-4 pb-0 border-t flex-shrink-0">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSend()
                                }
                            }}
                        />
                        <Button size="icon" className="flex-shrink-0" onClick={handleSend} disabled={isThinking}>
                            <IconSend className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        AI can make mistakes. Double-check important items.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}