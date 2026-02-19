import { apiClient } from "@/lib/apiClient"
import { AcceptAssistantRequest, AcceptAssistantResponse, ChatAssistantRequest, ChatAssistantResponse, StartAssistantRequest, StartAssistantResponse } from "@/types/assistant"

export const assistantService = {
    start: async ({ tripId }: StartAssistantRequest) => {
        let url = "/assistant/start"
        if (tripId) {
            url += `?trip_id=${tripId}`
        }
        const response = await apiClient.post(url, {})
        return response as StartAssistantResponse
    },

    async * chat(chatAssistantRequest: ChatAssistantRequest) {
        const response = await apiClient.stream("/assistant/chat", chatAssistantRequest);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("Stream reader not available");

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.replace('data: ', '').trim();
                        if (!jsonStr) continue;

                        try {
                            const parsed: ChatAssistantResponse = JSON.parse(jsonStr);
                            yield parsed;
                        } catch (e) {
                            console.error("Error parsing SSE JSON chunk", e);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    },

    accept: async (acceptAssistantRequest: AcceptAssistantRequest) => {
        const response = await apiClient.post("/assistant/accept", acceptAssistantRequest);
        return response as AcceptAssistantResponse;
    }
}
