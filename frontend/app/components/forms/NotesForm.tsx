'use client'

import { useState } from 'react'

interface NotesFormProps {
    onSubmit: (notes: string) => void
    onCancel: () => void
    initialNotes?: string
}

export default function NotesForm({ onSubmit, onCancel, initialNotes = '' }: NotesFormProps) {
    const [notes, setNotes] = useState(initialNotes || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(notes)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Notes
                </label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border-0 bg-tertiary p-3 placeholder:text-secondary"
                    placeholder="Add any notes about this item..."
                />
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-secondary hover:text-secondary-hover transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Save
                </button>
            </div>
        </form>
    )
} 