"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateItemRequest, DeleteItemRequest, Item, ItemOrigin, MarkItemReturningRequest, PackItemRequest, UnmarkItemReturningRequest, UnpackItemRequest, UpdateItemRequest } from "@/types/item"
import { itemService } from "@/services/itemService"
import { toast } from "sonner"

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

            queryClient.setQueryData(['items', tripId], (old: Item[]) => ([...(old || []), newItem as Item]))

            return { previousItems }
        },
        onError: (error, createItemRequest, context) => {
            toast.error("Failed to create item")
            if (context?.previousItems) {
                queryClient.setQueryData(['items', createItemRequest.tripId], context.previousItems)
            }
        },
        onSuccess: () => {
            toast.success("Item created successfully")
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


            queryClient.setQueryData(['items', tripId], (old: Item[]) => old.map(item => {
                if (item.id !== itemId) { return item }

                const updated_item = { ...item, ...updateItemRequest.updates }
                if (updateItemRequest.updates.quantity) {
                    const relevant_quantity = item.origin === ItemOrigin.LISTED ? 'listQuantity' : 'purchasedQuantity'
                    updated_item[relevant_quantity] = updateItemRequest.updates.quantity!
                }
                return updated_item
            })
            )

            return { previousItems }
        },
        onError: (error, updateItemRequest, context) => {
            toast.error("Failed to update item")
            if (context?.previousItems) {
                queryClient.setQueryData(['items', updateItemRequest.tripId], context.previousItems)
            }
        },
        onSuccess: () => {
            toast.success("Item updated successfully")
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

            queryClient.setQueryData(['items', tripId], (old: Item[]) => old.filter((item) => item.id !== itemId))

            return { previousItems }
        },
        onError: (error, deleteItemRequest, context) => {
            toast.error("Failed to delete item")
            if (context?.previousItems) {
                queryClient.setQueryData(['items', deleteItemRequest.tripId], context.previousItems)
            }
        },
        onSuccess: () => {
            toast.success("Item deleted successfully")
        },
        onSettled: (data, error, deleteItemRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', deleteItemRequest.tripId] })
        },
    })

    const markAsPacked = useMutation({
        mutationFn: async (markAsPackedRequest: PackItemRequest) => await itemService.markAsPacked(markAsPackedRequest),
        onMutate: async (markAsPackedRequest: PackItemRequest) => {
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

            queryClient.setQueryData(['items', tripId], (old: Item[]) => old.map((item) => {
                if (item.id !== itemId) { return item }

                const updatedItem: any = { ...item }
                updatedItem[originQuantity] = isEntireQuantity ? undefined : (item as any)[originQuantity] - quantity!
                updatedItem.packedQuantity = updatedItem.packedQuantity || 0
                updatedItem.packedQuantity += isEntireQuantity ? (item as any)[originQuantity] : quantity!
                return updatedItem as Item
            })
            )

            return { previousItems }
        },
        onError: (error, markAsPackedRequest, context) => {
            toast.error("Failed to mark item as packed")
            if (context?.previousItems) {
                queryClient.setQueryData(['items', markAsPackedRequest.tripId], context.previousItems)
            }
        },
        onSuccess: () => {
            toast.success("Item marked as packed successfully")
        },
        onSettled: (data, error, markAsPackedRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', markAsPackedRequest.tripId] })
        },
    })

    const unmarkAsPacked = useMutation({
        mutationFn: async (unmarkAsPackedRequest: UnpackItemRequest) => await itemService.unmarkAsPacked(unmarkAsPackedRequest),
        onMutate: async (unmarkAsPackedRequest: UnpackItemRequest) => {
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

            queryClient.setQueryData(['items', tripId], (old: Item[]) => old.map((item) => {
                if (item.id !== itemId) { return item }

                const updatedItem: any = { ...item }
                updatedItem[originQuantity] = updatedItem[originQuantity] || 0
                updatedItem[originQuantity] += isEntireQuantity ? item.packedQuantity : quantity!
                updatedItem.packedQuantity = isEntireQuantity ? undefined : item.packedQuantity! - quantity!
                return updatedItem as Item
            })
            )

            return { previousItems }
        },
        onError: (error, unmarkAsPackedRequest, context) => {
            toast.error("Failed to unmark item as packed")
            if (context?.previousItems) {
                queryClient.setQueryData(['items', unmarkAsPackedRequest.tripId], context.previousItems)
            }
        },
        onSuccess: () => {
            toast.success("Item unmarked as packed successfully")
        },
        onSettled: (data, error, unmarkAsPackedRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', unmarkAsPackedRequest.tripId] })
        },
    })

    const markItemReturning = useMutation({
        mutationFn: async (markItemReturningRequest: MarkItemReturningRequest) => await itemService.markAsReturning(markItemReturningRequest),
        onMutate: async (markItemReturningRequest: MarkItemReturningRequest) => {
            const {
                tripId,
                itemId,
                origin,
                quantity,
                isEntireQuantity
            } = markItemReturningRequest

            if (!isEntireQuantity && !quantity) {
                throw new Error("Quantity is required")
            }

            await queryClient.cancelQueries({ queryKey: ['items', tripId] })
            const previousItems = queryClient.getQueryData(['items', tripId])

            const originQuantity = {
                listed: "packedQuantity",
                purchased: "purchasedQuantity"
            }[origin]!

            queryClient.setQueryData(['items', tripId], (old: Item[]) => old.map((item) => {
                if (item.id !== itemId) { return item }

                const updatedItem: any = { ...item }
                updatedItem[originQuantity] = isEntireQuantity ? undefined : (item as any)[originQuantity] - quantity!
                updatedItem.returningQuantity = updatedItem.returningQuantity || 0
                updatedItem.returningQuantity += isEntireQuantity ? (item as any)[originQuantity] : quantity!
                return updatedItem as Item
            })
            )

            return { previousItems }
        },
        onError: (error, markItemReturningRequest, context) => {
            toast.error("Failed to mark item as returning")
            if (context?.previousItems) {
                queryClient.setQueryData(['items', markItemReturningRequest.tripId], context.previousItems)
            }
        },
        onSuccess: () => {
            toast.success("Item marked as returning successfully")
        },
        onSettled: (data, error, markItemReturningRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', markItemReturningRequest.tripId] })
        },
    })

    const unmarkItemReturning = useMutation({
        mutationFn: async (unmarkItemReturningRequest: UnmarkItemReturningRequest) => await itemService.unmarkAsReturning(unmarkItemReturningRequest),
        onMutate: async (unmarkItemReturningRequest: UnmarkItemReturningRequest) => {
            const { tripId,
                itemId,
                origin,
                isEntireQuantity,
                quantity } = unmarkItemReturningRequest

            if (!isEntireQuantity && !quantity) {
                throw new Error("Quantity is required")
            }

            await queryClient.cancelQueries({ queryKey: ['items', tripId] })
            const previousItems = queryClient.getQueryData(['items', tripId])

            const originQuantity = {
                listed: "packedQuantity",
                purchased: "purchasedQuantity"
            }[origin]!

            queryClient.setQueryData(['items', tripId], (old: Item[]) => old.map((item) => {
                if (item.id !== itemId) { return item }

                const updatedItem: any = { ...item }
                updatedItem[originQuantity] = updatedItem[originQuantity] || 0
                updatedItem[originQuantity] += isEntireQuantity ? item.returningQuantity : quantity!
                updatedItem.returningQuantity = isEntireQuantity ? undefined : item.returningQuantity! - quantity!
                return updatedItem as Item
            })
            )

            return { previousItems }
        },
        onError: (error, unmarkItemReturningRequest, context) => {
            toast.error("Failed to unmark item as returning")
            if (context?.previousItems) {
                queryClient.setQueryData(['items', unmarkItemReturningRequest.tripId], context.previousItems)
            }
        },
        onSuccess: () => {
            toast.success("Item unmarked as returning successfully")
        },
        onSettled: (data, error, unmarkItemReturningRequest) => {
            queryClient.invalidateQueries({ queryKey: ['items', unmarkItemReturningRequest.tripId] })
        },
    })

    return {
        createItem: createItem.mutate,
        updateItem: updateItem.mutate,
        deleteItem: deleteItem.mutate,
        markAsPacked: markAsPacked.mutate,
        unmarkAsPacked: unmarkAsPacked.mutate,
        markItemReturning: markItemReturning.mutate,
        unmarkItemReturning: unmarkItemReturning.mutate,
    }
}