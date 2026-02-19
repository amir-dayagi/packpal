import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateItemRequest, DeleteItemRequest, Item, ItemOrigin, MarkAsPackedRequest, UnmarkAsPackedRequest, UpdateItemRequest } from "@/app_old/types/item"
import { itemService } from "@/app_old/services/itemService"

export const useItemActions = () => {
    const queryClient = useQueryClient()

    const createItem = useMutation({
        mutationFn: async (createItemRequest: CreateItemRequest) => await itemService.create(createItemRequest),
        onMutate: async (createItemRequest: CreateItemRequest) => {
            const tripId = createItemRequest.tripId

            await queryClient.cancelQueries({ queryKey: ['items', tripId] })
            const previousItems = queryClient.getQueryData(['items', tripId])

            const relevantQuantity = {
                listed: "listQuantity",
                purchased: "purchasedQuantity"
            }[createItemRequest.newItem.origin]
            const newItem: any = {
                id: Date.now(),
                tripId: tripId,
                ...createItemRequest.newItem
            }
            newItem[relevantQuantity] = createItemRequest.newItem.quantity || 1

            queryClient.setQueryData(['items', tripId], (old: { items: Item[] }) => ({
                items: [...(old?.items || []), newItem as Item],
            }))

            return { previousItems }
        },
        onError: (error, createItemRequest, context) => {
            console.error('Error creating item:', error)
            if (context?.previousItems) {
                queryClient.setQueryData(['items', createItemRequest.tripId], context.previousItems)
            }
        },
        onSettled: (data, error, createItemRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', createItemRequest.tripId] })
        },
    })

    const updateItem = useMutation({
        mutationFn: async (updateItemRequest: UpdateItemRequest) => await itemService.update(updateItemRequest),
        onMutate: async (updateItemRequest) => {
            const tripId = updateItemRequest.tripId
            const itemId = updateItemRequest.itemId

            await queryClient.cancelQueries({ queryKey: ['items', tripId] })
            const previousItems = queryClient.getQueryData(['items', tripId])


            queryClient.setQueryData(['items', tripId], (old: { items: Item[] }) => ({
                items: (old?.items || []).map(item => {
                    if (item.id !== itemId) { return item }

                    const updated_item = { ...item, ...updateItemRequest.updates }
                    if (updateItemRequest.updates.quantity) {
                        const relevant_quantity = item.origin === ItemOrigin.LISTED ? 'listQuantity' : 'purchasedQuantity'
                        updated_item[relevant_quantity] = updateItemRequest.updates.quantity!
                    }
                    return updated_item
                })
            }))

            return { previousItems }
        },
        onError: (error, updateItemRequest, context) => {
            console.error('Error updating item:', error)
            if (context?.previousItems) {
                queryClient.setQueryData(['items', updateItemRequest.tripId], context.previousItems)
            }
        },
        onSettled: (data, error, updateItemRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', updateItemRequest.tripId] })
        },
    })

    const deleteItem = useMutation({
        mutationFn: async (deleteItemRequest: DeleteItemRequest) => await itemService.delete(deleteItemRequest),
        onMutate: async (deleteItemRequest: DeleteItemRequest) => {
            const tripId = deleteItemRequest.tripId
            const itemId = deleteItemRequest.itemId

            await queryClient.cancelQueries({ queryKey: ['items', tripId] })
            const previousItems = queryClient.getQueryData(['items', tripId])

            queryClient.setQueryData(['items', tripId], (old: { items: Item[] }) => ({
                items: (old?.items || []).filter((item) => item.id !== itemId),
            }))

            return { previousItems }
        },
        onError: (error, deleteItemRequest, context) => {
            console.error('Error updating item:', error)
            if (context?.previousItems) {
                queryClient.setQueryData(['items', deleteItemRequest.tripId], context.previousItems)
            }
        },
        onSettled: (data, error, deleteItemRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', deleteItemRequest.tripId] })
        },
    })

    const markAsPacked = useMutation({
        mutationFn: async (markAsPackedRequest: MarkAsPackedRequest) => await itemService.markAsPacked(markAsPackedRequest),
        onMutate: async (markAsPackedRequest: MarkAsPackedRequest) => {
            const {
                tripId,
                itemId,
                origin,
                quantity,
                isEntireQuantity
            } = markAsPackedRequest

            if (!isEntireQuantity && !quantity) {
                throw new Error("Quantity is required")
            }

            await queryClient.cancelQueries({ queryKey: ['items', tripId] })
            const previousItems = queryClient.getQueryData(['items', tripId])

            const originQuantity = {
                listed: "listQuantity",
                purchased: "purchasedQuantity"
            }[origin]!

            queryClient.setQueryData(['items', tripId], (old: { items: Item[] }) => ({
                items: (old?.items || []).map((item) => {
                    if (item.id !== itemId) { return item }

                    const updatedItem: any = { ...item }
                    updatedItem[originQuantity] = isEntireQuantity ? undefined : (item as any)[originQuantity] - quantity!
                    updatedItem.packedQuantity = updatedItem.packedQuantity || 0
                    updatedItem.packedQuantity += isEntireQuantity ? (item as any)[originQuantity] : quantity!
                    return updatedItem as Item
                })
            }))

            return { previousItems }
        },
        onError: (error, markAsPackedRequest, context) => {
            console.error('Error updating item:', error)
            if (context?.previousItems) {
                queryClient.setQueryData(['items', markAsPackedRequest.tripId], context.previousItems)
            }
        },
        onSettled: (data, error, markAsPackedRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', markAsPackedRequest.tripId] })
        },
    })

    const unmarkAsPacked = useMutation({
        mutationFn: async (unmarkAsPackedRequest: UnmarkAsPackedRequest) => await itemService.unmarkAsPacked(unmarkAsPackedRequest),
        onMutate: async (unmarkAsPackedRequest: UnmarkAsPackedRequest) => {
            const { tripId,
                itemId,
                origin,
                isEntireQuantity,
                quantity } = unmarkAsPackedRequest

            if (!isEntireQuantity && !quantity) {
                throw new Error("Quantity is required")
            }

            await queryClient.cancelQueries({ queryKey: ['items', tripId] })
            const previousItems = queryClient.getQueryData(['items', tripId])

            const originQuantity = {
                listed: "listQuantity",
                purchased: "purchasedQuantity"
            }[origin]!

            queryClient.setQueryData(['items', tripId], (old: { items: Item[] }) => ({
                items: (old?.items || []).map((item) => {
                    if (item.id !== itemId) { return item }

                    const updatedItem: any = { ...item }
                    updatedItem[originQuantity] = updatedItem[originQuantity] || 0
                    updatedItem[originQuantity] += isEntireQuantity ? item.packedQuantity : quantity!
                    updatedItem.packedQuantity = isEntireQuantity ? undefined : item.packedQuantity! - quantity!
                    return updatedItem as Item
                })
            }))

            return { previousItems }
        },
        onError: (error, unmarkAsPackedRequest, context) => {
            console.error('Error updating item:', error)
            if (context?.previousItems) {
                queryClient.setQueryData(['items', unmarkAsPackedRequest.tripId], context.previousItems)
            }
        },
        onSettled: (data, error, unmarkAsPackedRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', unmarkAsPackedRequest.tripId] })
        },
    })

    return {
        createItem: createItem.mutate,
        updateItem: updateItem.mutate,
        deleteItem: deleteItem.mutate,
        markAsPacked: markAsPacked.mutate,
        unmarkAsPacked: unmarkAsPacked.mutate,
    }
}