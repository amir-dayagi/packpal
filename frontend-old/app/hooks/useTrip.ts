import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { tripService } from "@/app_old/services/tripService"
import { Trip, UpdateTripRequest } from "@/app_old/types/trip"

export const useTrip = (tripId: number) => {
    const queryClient = useQueryClient()
    const router = useRouter()

    const { data: trip } = useSuspenseQuery<Trip>({
        queryKey: ['trip', tripId],
        queryFn: async () => tripService.get({ tripId })
    })

    const updateTrip = useMutation({
        mutationFn: async ({ updates }: Omit<UpdateTripRequest, 'tripId'>) => await tripService.update({ tripId, updates }),
        onMutate: async ({ updates }: Omit<UpdateTripRequest, 'tripId'>) => {
            await queryClient.cancelQueries({ queryKey: ['trip', tripId] })
            const previousTrip = queryClient.getQueryData<Trip>(['trip', tripId])

            queryClient.setQueryData<Trip>(['trip', tripId], (old) => {
                if (!old) { return old }
                return { ...old, ...updates }
            })

            return { previousTrip }
        },
        onError: (error, updateTripRequest, context) => {
            console.error('Error updating trip:', error)
            if (context?.previousTrip) {
                queryClient.setQueryData(['trip', tripId], context.previousTrip)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
        },
    })

    const deleteTrip = useMutation({
        mutationFn: async () => await tripService.delete({ tripId }),
        onSuccess: () => {
            router.replace('/dashboard')
        },
        onError: (error) => {
            console.error('Error deleting trip:', error)
        },
    })

    return {
        trip,
        updateTrip: updateTrip.mutate,
        deleteTrip: deleteTrip.mutate,
    }
}