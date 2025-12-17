'use client'

import Link from 'next/link'
import { formatDate } from '../utils/date'
import { Trip } from '../types/trip'
import { useAuth } from '../contexts/auth'
import { useState } from 'react'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface TripCardProps {
    trip: Trip;
    onDelete: () => void;
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
    const { session } = useAuth()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation
        setIsDeleteModalOpen(true)
    }

    return (
        <>
            <Link 
                href={`/trip?tripId=${trip.id}`}
                className="group block p-6 rounded-lg bg-tertiary hover:bg-tertiary-hover transition-colors relative"
            >
                <button
                    onClick={handleDelete}
                    className="absolute top-4 right-4 text-secondary opacity-0 group-hover:cursor-pointer group-hover:opacity-100 hover:text-secondary-hover transition-all"
                    aria-label="Delete trip"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>

                <h2 className="text-xl font-semibold mb-2">{trip.name}</h2>
                <p className="text-secondary mb-4 line-clamp-2">{trip.description}</p>
                <div className="text-sm text-secondary">
                    <p>
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </p>
                </div>
            </Link>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    onDelete()
                    setIsDeleteModalOpen(false)
                }}
                message={`Are you sure you want to delete "${trip.name}"? This will permanently delete all items in this trip and cannot be undone.`}
                itemName="Trip"
            />
        </>
    )
} 