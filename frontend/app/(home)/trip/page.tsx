"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/auth'
import { useSearchParams, useRouter } from 'next/navigation'
import { Trip } from '../../types/trip'
import { Item, ItemRequest } from '../../types/item'
import PackingListItem from '../../components/PackingListItem'
import { formatDate } from '../../utils/date'
import { useState } from 'react'
import Modal from '../../components/Modal'
import CreateItemForm from '../../components/forms/CreateItemForm'
import TripForm from '../../components/forms/TripForm'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'

export default function TripPage() {
    const { session } = useAuth()
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const router = useRouter()
    const tripId = Number(searchParams.get('tripId'))
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false)
    const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false)
    const [isDeleteTripConfirmOpen, setIsDeleteTripConfirmOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null)

    const { data: tripData } = useSuspenseQuery<{ trip: Trip }>({
        queryKey: ['trip', tripId],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}`, {
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
            return response.json()
        }
    })

    const { data: packingListData } = useSuspenseQuery<{ packing_list: Item[] }>({
        queryKey: ['packing_list', tripId],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}/packing-list`, {
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
            return response.json()
        }
    })

    const createItem = useMutation({
        mutationFn: async (item: ItemRequest) => (
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session}`
                },
                body: JSON.stringify(item)
            })
        ),
        onMutate: async (item: ItemRequest) => {
            await queryClient.cancelQueries({ queryKey: ['packing_list', tripId] })
            const previousPackingList = queryClient.getQueryData(['packing_list', tripId])
            queryClient.setQueryData(['packing_list', tripId], (old: { packing_list: Item[] }) => ({
                packing_list: [...old.packing_list, { id: Date.now(), ...item, is_packed: false, is_returning: false, created_at: new Date().toISOString()}]
            }))
            return { previousPackingList }
        },
        onError: (error, item, context) => {
            console.error('Error creating item:', error)
            if (context?.previousPackingList) {
                queryClient.setQueryData(['packing_list', tripId], context.previousPackingList)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['packing_list', tripId] })
            setIsCreateItemModalOpen(false)
        },
    })

    const deleteItem = useMutation({
        mutationFn: async (itemId: number) => (
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
        ),
        onMutate: async (itemId: number) => {
            await queryClient.cancelQueries({ queryKey: ['packing_list', tripId] })
            const previousPackingList = queryClient.getQueryData(['packing_list', tripId])
            queryClient.setQueryData(['packing_list', tripId], (old: { packing_list: Item[] }) => ({
                packing_list: old.packing_list.filter((item) => item.id !== itemId)
            }))
            return { previousPackingList }
        },
        onError: (error, itemId, context) => {
            console.error('Error deleting item:', error)
            if (context?.previousPackingList) {
                queryClient.setQueryData(['packing_list', tripId], context.previousPackingList)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['packing_list', tripId] })
            setItemToDelete(null)
        }
    })

    const updateItem = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Item> & { id: number }) => (
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session}`
                },
                body: JSON.stringify(updates)
            })
        ),
        onMutate: async ({ id, ...updates }: Partial<Item> & { id: number }) => {
            await queryClient.cancelQueries({ queryKey: ['packing_list', tripId] })
            const previousPackingList = queryClient.getQueryData(['packing_list', tripId])
            if (updates.quantity !== undefined && updates.quantity === 0) {
                queryClient.setQueryData(['packing_list', tripId], (old: { packing_list: Item[] }) => ({
                    packing_list: old.packing_list.filter((item) => item.id !== id)
                }))
            } else {
                queryClient.setQueryData(['packing_list', tripId], (old: { packing_list: Item[] }) => ({
                    packing_list: old.packing_list.map((item) => item.id === id ? { ...item, ...updates } : item)
                }))
            }
            
            return { previousPackingList }
        },
        onError: (error, item, context) => {
            console.error('Error updating item:', error)
            if (context?.previousPackingList) {
                queryClient.setQueryData(['packing_list', tripId], context.previousPackingList)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['packing_list', tripId] })
        }
    })

    const updateTrip = useMutation({
        mutationFn: async (updates: Partial<Trip>) => (
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session}`
                },
                body: JSON.stringify(updates)
            })
        ),
        onMutate: async (updates: Partial<Trip>) => {
            await queryClient.cancelQueries({ queryKey: ['trip', tripId] })
            const previousTrip = queryClient.getQueryData(['trip', tripId])
            queryClient.setQueryData(['trip', tripId], (old: { trip: Trip }) => ({
                trip: { ...old.trip, ...updates }
            }))
            return { previousTrip }
        },
        onError: (error, updates, context) => {
            console.error('Error updating trip:', error)
            if (context?.previousTrip) {
                queryClient.setQueryData(['trip', tripId], context.previousTrip)
            }
        },
        onSettled: () => {
            setIsEditTripModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
        }
    })

    const deleteTrip = useMutation({
        mutationFn: async () => (
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            })
        ),
        onSuccess: () => {
            router.push('/')
        },
        onError: (error) => {
            console.error('Error deleting trip:', error)
        }
    })

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{tripData.trip.name}</h1>
                            <p className="text-secondary mt-2">
                                {formatDate(tripData.trip.start_date)} - {formatDate(tripData.trip.end_date)}
                            </p>
                            {tripData.trip.description && (
                                <p className="mt-4 text-secondary">{tripData.trip.description}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditTripModalOpen(true)}
                                className="p-2 text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                                aria-label="Edit trip"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setIsDeleteTripConfirmOpen(true)}
                                className="p-2 text-secondary hover:cursor-pointer hover:text-red-500 transition-colors"
                                aria-label="Delete trip"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Packing List</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.push(`/assistant?tripId=${tripId}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                    </svg>
                                    Refine with AI
                                </button>
                                <button
                                    onClick={() => setIsCreateItemModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Add Item
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {packingListData?.packing_list.length === 0 ? (
                                <p className="text-secondary text-center py-8">
                                    No items in your packing list yet.
                                </p>
                            ) : (
                                packingListData?.packing_list.map((item) => (
                                    <PackingListItem
                                        key={item.id}
                                        item={item}
                                        onQuantityUpdate={(quantity) => 
                                            updateItem.mutate({ id: item.id, quantity })
                                        }
                                        onTogglePacked={() => 
                                            updateItem.mutate({ 
                                                id: item.id, 
                                                is_packed: !item.is_packed 
                                            })
                                        }
                                        onToggleReturning={() => 
                                            updateItem.mutate({ 
                                                id: item.id, 
                                                is_returning: !item.is_returning 
                                            })
                                        }
                                        onDelete={() => setItemToDelete(item)}
                                        onNotesUpdate={(notes) => 
                                            updateItem.mutate({ id: item.id, notes })
                                        }
                                        onNameUpdate={(name) =>
                                            updateItem.mutate({ id: item.id, name })
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <Modal isOpen={isCreateItemModalOpen} onClose={() => setIsCreateItemModalOpen(false)} title="Add Item">
                <CreateItemForm
                    onSubmit={(item) => {
                        createItem.mutate(item)
                    }}
                    onCancel={() => setIsCreateItemModalOpen(false)}
                    tripId={tripId}
                />
            </Modal>

            <Modal isOpen={isEditTripModalOpen} onClose={() => setIsEditTripModalOpen(false)} title="Edit Trip">
                <TripForm
                    onSubmit={(updates) => updateTrip.mutate(updates)}
                    onCancel={() => setIsEditTripModalOpen(false)}
                    initialData={tripData.trip}
                />
            </Modal>

            <DeleteConfirmationModal
                isOpen={isDeleteTripConfirmOpen}
                onClose={() => setIsDeleteTripConfirmOpen(false)}
                onConfirm={() => deleteTrip.mutate()}
                message={`Are you sure you want to delete "${tripData.trip.name}"? This will permanently delete all items in this trip and cannot be undone.`}
                itemName="Trip"
            />

            <DeleteConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => {
                    if (itemToDelete) {
                        deleteItem.mutate(itemToDelete.id)
                    }
                }}
                message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                itemName="Item"
            />
        </div>
    )
} 