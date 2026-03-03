"use client"

import { useState, useEffect } from "react"
import { AcceptAssistantRequest, AssistantCategory, AssistantItem, AssistantMessage, AssistantTrip, ChatAssistantMode, ChatAssistantRequest, ChatAssistantValues, StartAssistantRequest } from "@/types/assistant"
import { assistantService } from "@/services/assistantService"
import { useTripId } from "@/hooks/useTripId"
import { useRouter } from "next/navigation"
import { AssistantChatCard } from "@/components/assistant/AssistantChatCard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AssistantTripCard } from "@/components/assistant/AssistantTripCard"
import { AssistantPackingListCard } from "@/components/assistant/AssistantPackingListCard"
import { IconArrowLeft } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"


export default function AssistantPage() {
    const [messages, setMessages] = useState<AssistantMessage[]>([])
    const [trip, setTrip] = useState<AssistantTrip>({})
    const [categories, setCategories] = useState<AssistantCategory[]>([]);
    const [openCategories, setOpenCategories] = useState<Set<number>>(new Set());
    const [uncategorizedItems, setUncategorizedItems] = useState<AssistantItem[]>([]);
    const [isThinking, setIsThinking] = useState(false)
    const [isAcceptLoading, setIsAcceptLoading] = useState(false)
    const router = useRouter()

    let tripId: number | null = null
    try {
        tripId = useTripId()
    } catch (error) {
        // No trip selected
    }

    const isTrip = trip?.name || trip?.description || trip?.start_date || trip?.end_date

    const toggleCategory = (categoryId: number) => {
        setOpenCategories((prev) => {
            const newOpenCategories = new Set(prev);
            if (newOpenCategories.has(categoryId)) {
                newOpenCategories.delete(categoryId);
            } else {
                newOpenCategories.add(categoryId);
            }
            return newOpenCategories;
        });
    };

    const handleStart = async () => {
        setIsThinking(true)
        let request = {} as StartAssistantRequest
        if (tripId) {
            request.tripId = tripId
        }
        const response = await assistantService.start(request)
        setTrip(response.trip)
        setCategories(response.categories)
        setUncategorizedItems(response.uncategorized_items)
        setMessages([{ type: "ai", content: response.message }])
        setIsThinking(false)
    }

    useEffect(() => {
        handleStart()
    }, [])

    const handleChat = async (userMsg: string) => {
        setMessages((prevMessages) => [...prevMessages, { type: "human", content: userMsg }])
        const request = {
            user_msg: userMsg,
            trip: trip,
            categories: categories.filter((category) => category.name).map((category) => ({
                id: category.id && category.id > 0 ? category.id : undefined,
                name: category.name,
                items: category.items.filter((item) => item.name).map((item) => ({
                    id: item.id && item.id > 0 ? item.id : undefined,
                    name: item.name,
                    quantity: item.quantity,
                    notes: item.notes
                }))
            })),
            uncategorized_items: uncategorizedItems.filter((item) => item.name).map((item) => ({
                id: item.id && item.id > 0 ? item.id : undefined,
                name: item.name,
                quantity: item.quantity,
                notes: item.notes
            }))
        } as ChatAssistantRequest
        setIsThinking(true)
        try {
            const stream = assistantService.chat(request)
            setMessages((prevMessages) => [...prevMessages, { type: "ai", content: "" }])
            for await (const update of stream) {
                if (update.mode === ChatAssistantMode.MESSAGE) {
                    setMessages((prevMessages) => {
                        const newMessages = [...prevMessages]
                        const lastMessage = { ...newMessages[newMessages.length - 1] }
                        lastMessage.content += update.content as string
                        newMessages[newMessages.length - 1] = lastMessage
                        return newMessages
                    })
                } else if (update.mode === ChatAssistantMode.VALUES) {
                    const values = update.content as ChatAssistantValues
                    setTrip(values.trip)
                    setCategories(values.categories.map((category) => ({
                        ...category,
                        id: category.id || -Date.now() - Math.random(),
                        items: category.items.map((item) => ({
                            ...item,
                            id: item.id || -Date.now() - Math.random()
                        }))
                    })))
                    setUncategorizedItems(values.uncategorized_items.map((item) => ({
                        ...item,
                        id: item.id || -Date.now() - Math.random()
                    })))
                    if (values.messages && values.messages.length > 0 && values.messages[values.messages.length - 1].type === "ai") {
                        setMessages(values.messages)
                    }
                }
            }
        } catch (error) {
            toast.error(`Stream error: ${error}`)
        } finally {
            setIsThinking(false)
        }
    }

    const handleAccept = async () => {
        setIsAcceptLoading(true)
        const request = {
            trip: trip,
            categories: categories.filter((category) => category.name).map((category) => ({
                id: category.id && category.id > 0 ? category.id : undefined,
                name: category.name,
                items: category.items.filter((item) => item.name).map((item) => ({
                    id: item.id && item.id > 0 ? item.id : undefined,
                    name: item.name,
                    quantity: item.quantity,
                    notes: item.notes
                }))
            })),
            uncategorized_items: uncategorizedItems.filter((item) => item.name).map((item) => ({
                id: item.id && item.id > 0 ? item.id : undefined,
                name: item.name,
                quantity: item.quantity,
                notes: item.notes
            }))
        } as AcceptAssistantRequest
        try {
            const response = await assistantService.accept(request)
            setIsAcceptLoading(false)
            router.push(`/trip?tripId=${response.trip_id}`)
        } catch (error) {
            toast.error(`Failed to accept trip: ${error}`)
        } finally {
            setIsAcceptLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="w-fit text-muted-foreground hover:text-foreground"
            >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            <div className={`flex-1 gap-6 overflow-hidden grid ${isTrip ? "grid-cols-2" : "grid-cols-1"}`}>
                {isTrip && (
                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-6 pr-1">
                            <AssistantTripCard trip={trip} setTrip={setTrip} onAccept={handleAccept} isAcceptLoading={isAcceptLoading} />
                            <AssistantPackingListCard
                                categories={categories}
                                setCategories={setCategories}
                                uncategorizedItems={uncategorizedItems}
                                setUncategorizedItems={setUncategorizedItems}
                                openCategories={openCategories}
                                toggleCategory={toggleCategory}
                            />
                        </div>
                    </ScrollArea>
                )}
                <AssistantChatCard
                    messages={messages}
                    isThinking={isThinking || isAcceptLoading}
                    onChat={handleChat}
                />
            </div>
        </div>

    )
}