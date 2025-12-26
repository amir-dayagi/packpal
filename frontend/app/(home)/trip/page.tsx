"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/contexts/auth'
import { useSearchParams, useRouter } from 'next/navigation'
import { Trip } from '@/app/types/trip'
import { Item, ItemRequest } from '@/app/types/item'
import { useState } from 'react'
import Modal from '@/app/components/Modal'
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal'
import TripHeader from './TripHeader'
import PackingList from './PackingList'
import CreateItemForm from './CreateItemForm'
import EditTripForm from './EditTripForm'


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
            router.push('/trips')
        },
        onError: (error) => {
            console.error('Error deleting trip:', error)
        }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-tertiary">
            <div className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <TripHeader
                        trip={tripData.trip}
                        onEdit={() => setIsEditTripModalOpen(true)}
                        onDelete={() => setIsDeleteTripConfirmOpen(true)}
                    />
                </div>

                <PackingList
                    tripId={tripData.trip.id}
                    packingList={packingListData.packing_list}
                    onCreate={() => setIsCreateItemModalOpen(true)}
                    updateItem={updateItem}
                    setItemToDelete={setItemToDelete}
                />
            </div>

            {/* Create Item Modal */}
            <Modal isOpen={isCreateItemModalOpen} onClose={() => setIsCreateItemModalOpen(false)} title="Add Item">
                <CreateItemForm
                    onSubmit={(item) => {
                        createItem.mutate(item)
                    }}
                    onCancel={() => setIsCreateItemModalOpen(false)}
                    tripId={tripId}
                />
            </Modal>
            
            {/* Update Trip Modal */}
            <Modal isOpen={isEditTripModalOpen} onClose={() => setIsEditTripModalOpen(false)} title="Edit Trip">
                <EditTripForm
                    onSubmit={(updates) => updateTrip.mutate(updates)}
                    onCancel={() => setIsEditTripModalOpen(false)}
                    initialData={tripData.trip}
                />
            </Modal>
            
            {/* Delete Trip Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteTripConfirmOpen}
                onClose={() => setIsDeleteTripConfirmOpen(false)}
                onConfirm={() => deleteTrip.mutate()}
                message={`Are you sure you want to delete "${tripData.trip.name}"? This will permanently delete all items in this trip and cannot be undone.`}
                itemName="Trip"
            />

            {/* Delete Item Confirmaiton Modal */}
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