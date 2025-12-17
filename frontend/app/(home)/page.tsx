"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { Trip, TripRequest } from '../types/trip'
import { useAuth } from '../contexts/auth'
import Modal from '../components/Modal'
import CreateTripForm from '../components/forms/CreateTripForm'
import TripCard from '../components/TripCard'
import { useRouter } from 'next/navigation'

export default function HomePage() {
    const { session } = useAuth()
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()

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
            setIsModalOpen(false)
        }
    })

    return (
        <>
            <div className="min-h-screen p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center hover:cursor-pointer hover:bg-primary-hover transition-colors"
                            aria-label="Create new trip"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {(tripsData?.trips || []).map((trip) => (
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                onDelete={() => deleteTrip.mutate(trip.id)} 
                            />
                        ))}
                    </div>

                    {tripsData?.trips && tripsData.trips.length === 0 && (
                        <div className="text-center py-12 text-secondary">
                            <p className="text-lg">You haven't created any trips yet.</p>
                            <p className="mt-2">Click the + button to create your first trip!</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Trip"
            >
                <CreateTripForm 
                    onClose={() => setIsModalOpen(false)} 
                    onCreate={createTrip.mutate}
                />
            </Modal>
        </>
    )
}