export interface AssistantTrip {
    id?: number
    name?: string
    description?: string
    start_date?: string
    end_date?: string
}

export interface AssistantCategory {
    id?: number
    name: string
    items: AssistantItem[]
}

export interface AssistantItem {
    id?: number
    name: string
    notes?: string
    quantity: number
}

export interface AssistantMessage {
    role: "user" | "assistant"
    content: string
}

export interface StartAssistantRequest {
    tripId?: number
}

export interface StartAssistantResponse {
    message: string
    trip: AssistantTrip
    categories: AssistantCategory[]
    uncategorized_items: AssistantItem[]
}

export interface ChatAssistantRequest {
    user_msg: string
    trip: AssistantTrip
    categories: AssistantCategory[]
    uncategorized_items: AssistantItem[]
}

export enum ChatAssistantMode {
    MESSAGE = "message",
    VALUES = "values"
}

export interface ChatAssistantValues {
    trip: AssistantTrip
    categories: AssistantCategory[]
    uncategorized_items: AssistantItem[]
}

export interface ChatAssistantResponse {
    done: boolean
    mode: ChatAssistantMode
    content: string | ChatAssistantValues
}

export interface AcceptAssistantRequest {
    trip: AssistantTrip
    categories: AssistantCategory[]
    uncategorized_items: AssistantItem[]
}

export interface AcceptAssistantResponse {
    trip_id: number
}
