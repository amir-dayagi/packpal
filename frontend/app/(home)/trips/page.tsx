"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Trip, TripRequest } from '@/app/types/trip'
import { useAuth } from '@/app/contexts/auth'
import Modal from '@/app/components/Modal'
import { useRouter } from 'next/navigation'
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal'
import HeaderSection from './HeaderSection'
import TripsGrid from './TripsGrid'
import CreateTripForm from './CreateTripForm'


export default function TripsPage() {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState<Trip|undefined>(undefined);
    const router = useRouter();

    const { data: tripsData } = useSuspenseQuery<{ trips: Trip[] }>({
        queryKey: ['trips', session],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips`, {
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
            return response.json()
        }
    })

    const deleteTrip = useMutation({
        mutationFn: async (tripId: number) => (
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
        ),
        onMutate: async (tripId: number) => {
            await queryClient.cancelQueries({ queryKey: ['trips', session] })
            const previousTrips = queryClient.getQueryData(['trips', session])
            queryClient.setQueryData(['trips', session], (old: { trips: Trip[] } | undefined) => ({
                trips: (old?.trips || []).filter((trip) => trip.id !== tripId)
            }))
            return { previousTrips }
        },
        onError: (error, tripId, context) => {
            console.error('Error deleting trip:', error)
            if (context?.previousTrips) {
                queryClient.setQueryData(['trips', session], context.previousTrips)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['trips', session] })
        }
    })

    const createTrip = useMutation({
        mutationFn: async (trip: TripRequest) => (
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session}`
                },
                body: JSON.stringify(trip)
            }).then(async (res) => {
                if (res.ok) {
                    const data = await res.json()
                    return data.trip
                }
                throw new Error(res.statusText)
            })
        ),
        onMutate: async (trip: TripRequest) => {
            await queryClient.cancelQueries({ queryKey: ['trips', session] })
            const previousTrips = queryClient.getQueryData(['trips', session])
            queryClient.setQueryData(['trips', session], (old: { trips: Trip[] } | undefined) => ({
                trips: [...(old?.trips || []), { id: Date.now(), ...trip, created_at: new Date().toISOString() }]
            }))
            return { previousTrips }
        },
        onError: (error, trip, context) => {
            console.error('Error creating trip:', error)
            if (context?.previousTrips) {
                queryClient.setQueryData(['trips', session], context.previousTrips)
            }
        },
        onSuccess: (data: Trip) => {
            if (data && data.id) {
                router.push(`/trip?tripId=${data.id}`)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['trips', session] })
            setIsCreateModalOpen(false)
        }
    })

    return (
        <>
            {/* Main Trips Page */}
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-tertiary">
                <div className="px-4 sm:px-6 lg:px-8 py-12">
                    <HeaderSection 
                        newTripAction={() => setIsCreateModalOpen(true)}
                        tripCount={tripsData?.trips && tripsData.trips.length}
                    />

                    <TripsGrid 
                        trips={tripsData?.trips}
                        onTripCreate={() => setIsCreateModalOpen(true)}
                        setTripToDelete={setTripToDelete}
                    />
                </div>
            </div>

            {/* Create Trip Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Trip"
            >
                <CreateTripForm 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onCreate={createTrip.mutate}
                />
            </Modal>

            {/* Delete Trip Modal */}
            <DeleteConfirmationModal
                isOpen={tripToDelete !== undefined}
                onClose={() => setTripToDelete(undefined)}
                onConfirm={() => {
                    deleteTrip.mutate(tripToDelete!.id);
                    setTripToDelete(undefined);
                }}
                message={`Are you sure you want to delete "${tripToDelete?.name}"? This will permanently delete all items in this trip and cannot be undone.`}
                itemName="trip"
            />
            
        </>
    )
}

