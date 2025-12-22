"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { Trip, TripRequest } from '../../types/trip'
import { useAuth } from '../../contexts/auth'
import Modal from '../../components/Modal'
import CreateTripForm from '../../components/forms/CreateTripForm'
import TripCard from '../../components/TripCard'
import { useRouter } from 'next/navigation'

export default function TripsPage() {
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
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-tertiary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2">My Trips</h1>
                            <p className="text-secondary">
                                {tripsData?.trips && tripsData.trips.length > 0 
                                    ? `${tripsData.trips.length} ${tripsData.trips.length === 1 ? 'trip' : 'trips'} planned`
                                    : 'Plan your next adventure'
                                }
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 sm:mt-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                            aria-label="Create new trip"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>New Trip</span>
                        </button>
                    </div>

                    {/* Trips Grid */}
                    {tripsData?.trips && tripsData.trips.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {tripsData.trips.map((trip) => (
                                <TripCard 
                                    key={trip.id} 
                                    trip={trip} 
                                    onDelete={() => deleteTrip.mutate(trip.id)} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-tertiary/50 shadow-lg p-16 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-hover/20 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-foreground mb-2">No trips yet</h3>
                            <p className="text-secondary mb-6 max-w-md mx-auto">
                                Start planning your next adventure by creating your first trip. PackPal will help you organize everything you need.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 transform hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span>Create Your First Trip</span>
                            </button>
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

