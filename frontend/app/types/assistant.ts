import { Item } from "./item";
import { Trip } from "./trip";

export interface AssistantStartChatResponse {
    assistant_process_id: number;
}

export interface AssistantChatMessage {
    role: string;
    content: string;
}


export interface AssistantStreamedData {
    message: AssistantChatMessage;
    trip: Partial<Trip>;
    packing_list: Partial<Item>[];
    done: boolean;
}