"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { tripService } from "@/services/tripService"
import { Trip, TripStatus, UpdateTripRequest } from "@/types/trip"
import { categoryService } from "@/services/categoryService"
import { Category, CategoryViewModel, categoryViewModelMapper } from "@/types/category"
import { itemService } from "@/services/itemService"
import { Item, ItemViewModel, itemViewModelMapper } from "@/types/item"
import { useMemo } from "react"
import { toast } from "sonner"
import { parseISO } from "date-fns"

export const useTrip = (tripId: number) => {
    const queryClient = useQueryClient()
    const router = useRouter()

    const { data: trip } = useSuspenseQuery<Trip>({
        queryKey: ['trip', tripId],
        queryFn: async () => tripService.get({ tripId })
    })

    const { data: categories } = useSuspenseQuery<Category[]>({
        queryKey: ['categories', tripId],
        queryFn: () => categoryService.getAll({ tripId }),
    })

    const { data: items } = useSuspenseQuery<Item[]>({
        queryKey: ['items', tripId],
        queryFn: () => itemService.getAll({ tripId }),
    })

    const groupItemsByCategory = (quantityField: 'listQuantity' | 'packedQuantity' | 'returningQuantity' | 'purchasedQuantity', categories: Category[], items: Item[]): CategoryViewModel[] => {
        return categories.map(category => {
            const categoryItems = items.filter(item => item.categoryId === category.id && (item as any)[quantityField] > 0).map(item => itemViewModelMapper(item, quantityField))
            return categoryViewModelMapper(category, categoryItems)
        })
    }

    const getUncategorizedItems = (quantityField: 'listQuantity' | 'packedQuantity' | 'returningQuantity' | 'purchasedQuantity', items: Item[]): ItemViewModel[] => {
        return items.filter(item => !item.categoryId && (item as any)[quantityField] > 0).map(item => itemViewModelMapper(item, quantityField))
    }

    const plannedSectionData = useMemo(() => {
        if (trip.status !== TripStatus.PACKING) {
            return { groups: [], uncategorizedItems: [] }
        }
        const groups = groupItemsByCategory('listQuantity', categories, items)
        const uncategorizedItems = getUncategorizedItems('listQuantity', items)
        return { groups, uncategorizedItems }
    }, [trip.status, categories, items])

    const packedSectionData = useMemo(() => {
        if (trip.status === TripStatus.COMPLETED) {
            return { groups: [], uncategorizedItems: [] }
        }
        const groups = groupItemsByCategory('packedQuantity', categories, items)
        const uncategorizedItems = getUncategorizedItems('packedQuantity', items)
        return { groups, uncategorizedItems }
    }, [trip.status, categories, items])

    const purchasedSectionData = useMemo(() => {
        if (trip.status !== TripStatus.TRAVELING) {
            return { groups: [], uncategorizedItems: [] }
        }
        const groups = groupItemsByCategory('purchasedQuantity', categories, items)
        const uncategorizedItems = getUncategorizedItems('purchasedQuantity', items)
        return { groups, uncategorizedItems }
    }, [trip.status, categories, items])

    const returnedSectionData = useMemo(() => {
        if (trip.status !== TripStatus.TRAVELING) {
            return { groups: [], uncategorizedItems: [] }
        }
        const groups = groupItemsByCategory('returningQuantity', categories, items)
        const uncategorizedItems = getUncategorizedItems('returningQuantity', items)
        return { groups, uncategorizedItems }
    }, [trip.status, categories, items])

    const updateTrip = useMutation({
        mutationFn: async ({ updates }: Omit<UpdateTripRequest, 'tripId'>) => await tripService.update({ tripId, updates }),
        onMutate: async ({ updates }: Omit<UpdateTripRequest, 'tripId'>) => {
            await queryClient.cancelQueries({ queryKey: ['trip', tripId] })
            await queryClient.cancelQueries({ queryKey: ['activeTrips'] })
            const previousTrip = queryClient.getQueryData<Trip>(['trip', tripId])
            const previousTrips = queryClient.getQueryData<Trip[]>(['activeTrips'])

            if (updates.status === TripStatus.COMPLETED) {
                queryClient.setQueryData<Trip[]>(['activeTrips'], (old) => (old || []).filter(trip => trip.id !== tripId))
            }

            queryClient.setQueryData<Trip>(['trip', tripId], (old) => {
                if (!old) { return old }
                return {
                    ...old,
                    name: updates.name ?? old.name,
                    description: updates.description ?? old.description,
                    startDate: updates.startDate ? parseISO(updates.startDate) : old.startDate,
                    endDate: updates.endDate ? parseISO(updates.endDate) : old.endDate,
                    status: updates.status ?? old.status
                }
            })

            return { previousTrip, previousTrips }
        },
        onError: (error, updateTripRequest, context) => {
            toast.error("Failed to update trip")
            if (context?.previousTrip) {
                queryClient.setQueryData(['trip', tripId], context.previousTrip)
            }
            if (context?.previousTrips) {
                queryClient.setQueryData(['activeTrips'], context.previousTrips)
            }
        },
        onSuccess: () => {
            toast.success("Trip updated successfully")
        },
        onSettled: (trip, error, context) => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
            if (trip?.status === TripStatus.COMPLETED) {
                queryClient.invalidateQueries({ queryKey: ['activeTrips'] })
            }
        },
    })

    const deleteTrip = useMutation({
        mutationFn: async () => await tripService.delete({ tripId }),
        onSuccess: () => {
            toast.success("Trip deleted successfully")
            router.replace('/dashboard')
        },
        onError: (error) => {
            toast.error("Failed to delete trip")
        },
    })

    return {
        trip,
        updateTrip: updateTrip.mutate,
        deleteTrip: deleteTrip.mutate,
        plannedSectionData,
        packedSectionData,
        purchasedSectionData,
        returnedSectionData,
    }
}