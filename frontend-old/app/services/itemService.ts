import { CreateItemRequest, ItemListRequest, ItemRequest, itemResponseMapper, itemListResponseMapper, UpdateItemRequest, DeleteItemRequest, MarkAsPackedRequest, MarkAsReturningRequest, UnmarkAsPackedRequest, UnmarkAsReturningRequest } from "@/app_old/types/item"
import { apiClient } from "@/app_old/utils/apiClient"

export const itemService = {
    get: async ({ itemId }: ItemRequest) => itemResponseMapper(await apiClient.get(`/items/${itemId}`)),

    getAll: async ({ tripId }: ItemListRequest) => itemListResponseMapper(await apiClient.get(`/trips/${tripId}/items`)),

    create: async ({ tripId, newItem }: CreateItemRequest) => {
        const newItemDTO = {
            trip_id: tripId,
            name: newItem.name,
            origin: newItem.origin,
            quantity: newItem.quantity,
            notes: newItem.notes,
            category_id: newItem.categoryId
        }
        const response = await apiClient.post("/items", newItemDTO)
        return itemResponseMapper(response)
    },

    update: async ({ itemId, updates }: UpdateItemRequest) => {
        const updateItemDTO = {
            name: updates.name,
            quantity: updates.quantity,
            notes: updates.notes,
            category_id: updates.categoryId
        }
        const response = await apiClient.put(`/items/${itemId}`, updateItemDTO)
        return itemResponseMapper(response)
    },

    delete: async ({ itemId }: DeleteItemRequest) => apiClient.delete(`/items/${itemId}`),

    markAsPacked: async ({ itemId, isEntireQuantity, quantity }: MarkAsPackedRequest) => {
        const markAsPackedDTO = {
            quantity: quantity,
            is_entire_quantity: isEntireQuantity
        }
        return apiClient.put(`/items/${itemId}/mark-as-packed`, markAsPackedDTO)
    },

    markAsReturning: async ({ itemId, isEntireQuantity, quantity }: MarkAsReturningRequest) => {
        const markAsReturningDTO = {
            quantity: quantity,
            is_entire_quantity: isEntireQuantity
        }
        return apiClient.put(`/items/${itemId}/mark-as-returning`, markAsReturningDTO)
    },

    unmarkAsPacked: async ({ itemId, isEntireQuantity, quantity }: UnmarkAsPackedRequest) => {
        const markAsPackedDTO = {
            quantity: quantity,
            is_entire_quantity: isEntireQuantity
        }
        return apiClient.put(`/items/${itemId}/unmark-as-packed`, markAsPackedDTO)
    },

    unmarkAsReturning: async ({ itemId, isEntireQuantity, quantity }: UnmarkAsReturningRequest) => {
        const markAsReturningDTO = {
            quantity: quantity,
            is_entire_quantity: isEntireQuantity
        }
        return apiClient.put(`/items/${itemId}/unmark-as-returning`, markAsReturningDTO)
    },
}