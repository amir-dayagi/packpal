"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { tripService } from "@/services/tripService"
import { CreateTripRequest, DeleteTripRequest, Trip, TripStatus } from "@/types/trip"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { parseISO } from "date-fns"

export const useTrips = () => {
    const queryClient = useQueryClient()
    const router = useRouter()

    const { data: activeTrips } = useSuspenseQuery<Trip[]>({
        queryKey: ['activeTrips'],
        queryFn: async () => await tripService.getAllActive()
    })

    const { data: archivedTrips } = useSuspenseQuery<Trip[]>({
        queryKey: ['archivedTrips'],
        queryFn: async () => await tripService.getAllArchived()
    })

    const createTrip = useMutation({
        mutationFn: async (CreateTripRequest: CreateTripRequest) => await tripService.create(CreateTripRequest),
        onMutate: async (createTripRequest: CreateTripRequest) => {
            await queryClient.cancelQueries({ queryKey: ['activeTrips'] })
            const previousTrips = queryClient.getQueryData<Trip[]>(['activeTrips'])

            const newTrip: Trip = {
                id: Date.now(),
                createdAt: new Date().toISOString(),
                name: createTripRequest.newTrip.name,
                description: createTripRequest.newTrip.description,
                startDate: parseISO(createTripRequest.newTrip.startDate),
                endDate: parseISO(createTripRequest.newTrip.endDate),
                status: TripStatus.PACKING
            }

            queryClient.setQueryData<Trip[]>(['activeTrips'], (old) => {
                return [newTrip, ...(old || [])]
            })
            return { previousTrips }
        },
        onSuccess: (trip: Trip) => {
            toast.success("Trip created successfully")
            router.replace(`/trip?tripId=${trip.id}`)
        },
        onError: (error, createTripRequest, context) => {
            toast.error("Failed to create trip")
            if (context?.previousTrips) {
                queryClient.setQueryData(['activeTrips'], context.previousTrips)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['activeTrips'] })
        },
    })

    const deleteTrip = useMutation({
        mutationFn: async (deleteTripRequest: DeleteTripRequest) => await tripService.delete(deleteTripRequest),
        onMutate: async ({ tripId }: DeleteTripRequest) => {
            await queryClient.cancelQueries({ queryKey: ['activeTrips'] })
            const previousTrips = queryClient.getQueryData<Trip[]>(['activeTrips'])

            queryClient.setQueryData<Trip[]>(['activeTrips'], (old) => {
                return (old || []).filter((trip) => trip.id !== tripId)
            })
            return { previousTrips }
        },
        onSuccess: () => {
            toast.success("Trip deleted successfully")
            router.replace('/dashboard')
        },
        onError: (error, deleteTripRequest, context) => {
            toast.error("Failed to delete trip")
            if (context?.previousTrips) {
                queryClient.setQueryData(['activeTrips'], context.previousTrips)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['activeTrips'] })
        }
    })

    return {
        activeTrips,
        archivedTrips,
        createTrip: createTrip.mutate,
        deleteTrip: deleteTrip.mutate
    }
}