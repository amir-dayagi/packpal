import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { tripService } from "@/app_old/services/tripService"
import { CreateTripRequest, DeleteTripRequest, Trip, TripStatus } from "@/app_old/types/trip"

export const useTrips = () => {
    const queryClient = useQueryClient()

    const { data: trips } = useSuspenseQuery<Trip[]>({
        queryKey: ['trips'],
        queryFn: async () => await tripService.getAll()
    })

    const createTrip = useMutation({
        mutationFn: async (CreateTripRequest: CreateTripRequest) => await tripService.create(CreateTripRequest),
        onMutate: async (createTripRequest: CreateTripRequest) => {
            await queryClient.cancelQueries({ queryKey: ['trips'] })
            const previousTrips = queryClient.getQueryData<Trip[]>(['trips'])

            const newTrip: Trip = {
                id: Date.now(),
                createdAt: new Date().toISOString(),
                ...createTripRequest.newTrip,
                status: TripStatus.PACKING
            }

            queryClient.setQueryData<Trip[]>(['trips'], (old) => {
                return [newTrip, ...(old || [])]
            })
            return { previousTrips }
        },
        onError: (error, createTripRequest, context) => {
            console.error('Error creating trip:', error)
            if (context?.previousTrips) {
                queryClient.setQueryData(['trips'], context.previousTrips)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] })
        },
    })

    const deleteTrip = useMutation({
        mutationFn: async (deleteTripRequest: DeleteTripRequest) => await tripService.delete(deleteTripRequest),
        onMutate: async ({ tripId }: DeleteTripRequest) => {
            await queryClient.cancelQueries({ queryKey: ['trips'] })
            const previousTrips = queryClient.getQueryData<Trip[]>(['trips'])

            queryClient.setQueryData<Trip[]>(['trips'], (old) => {
                return (old || []).filter((trip) => trip.id !== tripId)
            })
            return { previousTrips }
        },
        onError: (error, deleteTripRequest, context) => {
            console.error('Error deleting trip:', error)
            if (context?.previousTrips) {
                queryClient.setQueryData(['trips'], context.previousTrips)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] })
        }
    })

    return {
        trips,
        createTrip: createTrip.mutate,
        deleteTrip: deleteTrip.mutate
    }
}