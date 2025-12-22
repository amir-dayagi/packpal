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
            <div className="group relative">
                <Link 
                    href={`/trip?tripId=${trip.id}`}
                    className="block h-full bg-background/80 backdrop-blur-sm rounded-2xl border border-tertiary/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-primary/30 hover:-translate-y-1"
                >
                    {/* Delete Button */}
                    <button
                        onClick={handleDelete}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-tertiary/50 text-secondary opacity-0 group-hover:opacity-100 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all duration-200 z-10"
                        aria-label="Delete trip"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>

                    {/* Trip Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-hover/20 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </div>

                    {/* Trip Content */}
                    <h2 className="text-xl font-semibold text-foreground mb-2 line-clamp-1">{trip.name}</h2>
                    {trip.description && (
                        <p className="text-secondary text-sm mb-4 line-clamp-2">{trip.description}</p>
                    )}
                    
                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-sm text-secondary pt-4 border-t border-tertiary/50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-9-9h.008v.008H12V9.75z" />
                        </svg>
                        <span className="line-clamp-1">
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </span>
                    </div>
                </Link>
            </div>

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