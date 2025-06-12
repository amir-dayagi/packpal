import { useState, useRef, useEffect } from 'react'
import { Item } from '../types/item'

interface EditablePackingListItemProps {
    item: Partial<Item>
    onQuantityUpdate: (quantity: number) => void
    onDelete: () => void
    onNotesUpdate: (notes: string) => void
    onNameUpdate: (name: string) => void
}

export default function EditablePackingListItem({ 
    item, 
    onQuantityUpdate,
    onDelete,
    onNotesUpdate,
    onNameUpdate
}: EditablePackingListItemProps) {
    const [isEditing, setIsEditing] = useState(item.name === '')
    const [editedName, setEditedName] = useState(item.name || '')
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [editedNotes, setEditedNotes] = useState(item.notes || '')
    const inputRef = useRef<HTMLInputElement>(null)
    const notesRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    useEffect(() => {
        if (isEditingNotes && notesRef.current) {
            notesRef.current.focus()
            notesRef.current.select()
        }
    }, [isEditingNotes])

    const handleNameSubmit = () => {
        if (editedName.trim() !== '' && editedName.trim() !== item.name) {
            onNameUpdate(editedName.trim())
        }
        setIsEditing(false)
    }

    const handleNotesSubmit = () => {
        if (editedNotes.trim() !== item.notes) {
            onNotesUpdate(editedNotes.trim())
        }
        setIsEditingNotes(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent, type: 'name' | 'notes') => {
        if (e.key === 'Enter' && type === 'name') {
            handleNameSubmit()
        } else if (e.key === 'Enter' && e.metaKey && type === 'notes') {
            handleNotesSubmit()
        } else if (e.key === 'Escape') {
            if (type === 'name') {
                setEditedName(item.name || '')
                setIsEditing(false)
            } else {
                setEditedNotes(item.notes || '')
                setIsEditingNotes(false)
            }
        }
    }

    return (
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
                            onKeyDown={(e) => handleKeyDown(e, 'name')}
                            onBlur={handleNameSubmit}
                            className="w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover"
                        />
                    ) : (
                        <div 
                            onClick={() => setIsEditing(true)}
                            className="cursor-text hover:text-secondary transition-colors"
                        >
                            {item.name || ''}
                        </div>
                    )}
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onQuantityUpdate((item.quantity || 1) - 1)}
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                        aria-label="Decrease quantity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                    </button>
                    <span className="w-8 text-center">{item.quantity || 1}</span>
                    <button
                        onClick={() => onQuantityUpdate((item.quantity || 1) + 1)}
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                        aria-label="Increase quantity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

            {/* Notes section */}
            <div className="px-4 py-2">
                {isEditingNotes ? (
                    <textarea
                        ref={notesRef}
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'notes')}
                        onBlur={handleNotesSubmit}
                        className="w-full bg-transparent border-b border-primary outline-none focus:border-primary-hover text-sm min-h-[60px] resize-none"
                        placeholder="Add notes..."
                    />
                ) : (
                    <div 
                        onClick={() => setIsEditingNotes(true)}
                        className="text-sm text-secondary hover:text-secondary-hover cursor-pointer"
                    >
                        {item.notes || 'Add notes...'}
                    </div>
                )}
            </div>
        </div>
    )
} 