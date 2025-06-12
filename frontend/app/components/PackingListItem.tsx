import { useState, useRef, useEffect } from 'react'
import { Item } from '../types/item'
import Modal from './Modal'
import NotesForm from './forms/NotesForm'

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
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(item.name)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    const handleNameSubmit = () => {
        if (editedName.trim() !== '' && editedName.trim() !== item.name) {
            onNameUpdate(editedName.trim())
        }
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameSubmit()
        } else if (e.key === 'Escape') {
            setEditedName(item.name)
            setIsEditing(false)
        }
    }

    const handleBlur = () => {
        handleNameSubmit()
    }

    return (
        <>
            <div className="space-y-1 bg-tertiary rounded-lg p-4">
                <div className="flex items-center gap-4">
                    {/* Item name */}
                    <div className="flex-1 font-medium">
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                className="w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover"
                            />
                        ) : (
                            <div 
                                onClick={() => setIsEditing(true)}
                                className="cursor-text hover:text-secondary transition-colors"
                            >
                                {item.name}
                            </div>
                        )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onQuantityUpdate(item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                            </svg>
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                            onClick={() => onQuantityUpdate(item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                            aria-label="Increase quantity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>

                    {/* Packed status */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary">Packed:</span>
                        <button
                            onClick={onTogglePacked}
                            className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:cursor-pointer ${
                                item.is_packed 
                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                    : 'bg-secondary/20 text-secondary hover:bg-secondary/30'
                            }`}
                            aria-label="Toggle packed status"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Returning status */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary">Returning:</span>
                        <button
                            onClick={onToggleReturning}
                            className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:cursor-pointer ${
                                item.is_returning
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-secondary/20 text-secondary hover:bg-secondary/30'
                            }`}
                            aria-label="Toggle returning status"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                        </button>
                    </div>

                    {/* Delete button */}
                    <button
                        onClick={onDelete}
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:cursor-pointer hover:text-red-500 transition-colors"
                        aria-label="Delete item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>

                {/* Notes row */}
                <div 
                    onClick={() => setIsNotesModalOpen(true)}
                    className="px-4 py-2 text-sm text-secondary hover:text-secondary-hover cursor-pointer"
                >
                    {item.notes || 'Add notes...'}
                </div>
            </div>

            <Modal isOpen={isNotesModalOpen} onClose={() => setIsNotesModalOpen(false)} title="Edit Notes">
                <NotesForm
                    onSubmit={(notes) => {
                        onNotesUpdate(notes)
                        setIsNotesModalOpen(false)
                    }}
                    onCancel={() => setIsNotesModalOpen(false)}
                    initialNotes={item.notes}
                />
            </Modal>
        </>
    )
} 