'use client'

import { useState, useRef, useEffect } from 'react'
import { Item } from '@/app/types/item'

interface PackingListItemProps {
    item: Item
    onQuantityUpdate: (quantity: number) => void
    onTogglePacked: () => void
    onToggleReturning: () => void
    onDelete: () => void
    onNotesUpdate: (notes: string) => void
    onNameUpdate: (name: string) => void
}

export default function PackingListItem({ 
    item, 
    onQuantityUpdate, 
    onTogglePacked, 
    onToggleReturning, 
    onDelete,
    onNotesUpdate,
    onNameUpdate
}: PackingListItemProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [editedName, setEditedName] = useState(item.name)
    const [editedNotes, setEditedNotes] = useState(item.notes || '')
    const nameInputRef = useRef<HTMLInputElement>(null)
    const notesInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus()
            nameInputRef.current.select()
        }
    }, [isEditingName])

    useEffect(() => {
        if (isEditingNotes && notesInputRef.current) {
            notesInputRef.current.focus()
            notesInputRef.current.select()
        }
    }, [isEditingNotes])

    const handleNameSubmit = () => {
        const trimmed = editedName.trim()
        if (trimmed !== '' && trimmed !== item.name) {
            onNameUpdate(trimmed)
        }
        setIsEditingName(false)
    }

    const handleNotesSubmit = () => {
        const trimmed = editedNotes.trim()
        if (trimmed !== (item.notes || '')) {
            onNotesUpdate(trimmed)
        }
        setIsEditingNotes(false)
    }

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleNameSubmit()
        } else if (e.key === 'Escape') {
            setEditedName(item.name)
            setIsEditingName(false)
        }
    }

    const handleNotesKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleNotesSubmit()
        } else if (e.key === 'Escape') {
            setEditedNotes(item.notes || '')
            setIsEditingNotes(false)
        }
    }

    return (
        <>
            <div className="bg-background border border-tertiary/50 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                    {/* Packed checkbox */}
                    <button
                        onClick={onTogglePacked}
                        className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            item.is_packed 
                                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25' 
                                : 'border-2 border-tertiary hover:border-primary/50 bg-background'
                        }`}
                        aria-label="Toggle packed status"
                    >
                        {item.is_packed && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        )}
                    </button>

                    {/* Item name */}
                    <div className="flex-1 min-w-0 space-y-1">
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={handleNameKeyDown}
                                onBlur={handleNameSubmit}
                                className="w-full bg-transparent border-b-2 border-primary outline-none focus:border-primary-hover text-foreground font-medium"
                            />
                        ) : (
                            <div 
                                onClick={() => setIsEditingName(true)}
                                className={`cursor-text font-medium transition-colors ${
                                    item.is_packed 
                                        ? 'text-secondary line-through' 
                                        : 'text-foreground hover:text-primary'
                                }`}
                            >
                                {item.name}
                            </div>
                        )}

                        {isEditingNotes ? (
                            <input
                                ref={notesInputRef}
                                type="text"
                                value={editedNotes}
                                onChange={(e) => setEditedNotes(e.target.value)}
                                onKeyDown={handleNotesKeyDown}
                                onBlur={handleNotesSubmit}
                                className="w-full bg-transparent border-b border-tertiary outline-none text-sm text-secondary focus:border-primary-hover"
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingNotes(true)}
                                className="cursor-text text-xs sm:text-sm text-secondary/80 hover:text-secondary transition-colors line-clamp-2"
                            >
                                {item.notes && item.notes.trim().length > 0
                                    ? item.notes
                                    : 'Add notes...'}
                            </div>
                        )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-tertiary/50 rounded-lg px-2 py-1">
                        <button
                            onClick={() => onQuantityUpdate(Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-secondary hover:text-foreground hover:bg-background transition-all duration-200"
                            aria-label="Decrease quantity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                            </svg>
                        </button>
                        <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                        <button
                            onClick={() => onQuantityUpdate(item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-secondary hover:text-foreground hover:bg-background transition-all duration-200"
                            aria-label="Increase quantity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>

                    {/* Returning status */}
                    <button
                        onClick={onToggleReturning}
                        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${
                            item.is_returning
                                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'
                                : 'bg-tertiary/50 text-secondary hover:text-blue-600 hover:bg-blue-50/50'
                        }`}
                        aria-label="Toggle returning status"
                        title={item.is_returning ? "Mark as not returning" : "Mark as returning"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                    </button>

                    {/* Delete button */}
                    <button
                        onClick={onDelete}
                        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-secondary hover:text-red-600 hover:bg-red-50/50 transition-all duration-200"
                        aria-label="Delete item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    )
} 