'use client'

import { useState } from 'react'
import { ItemRequest } from '../../types/item'

interface CreateItemFormProps {
    onSubmit: (item: ItemRequest) => void
    onCancel: () => void
    tripId: number
}

export default function CreateItemForm({ onSubmit, onCancel, tripId }: CreateItemFormProps) {
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            trip_id: Number(tripId),
            name,
            quantity,
            notes: notes || undefined
        })
        // Reset form
        setName('')
        setQuantity(1)
        setNotes('')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Item Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border-0 bg-tertiary p-3 placeholder:text-secondary"
                    placeholder="What do you need to pack?"
                    required
                />
            </div>

            <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                    Quantity
                </label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                    min="1"
                    className="w-full rounded-lg border-0 bg-tertiary p-3"
                    required
                />
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Notes (Optional)
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
                    Add Item
                </button>
            </div>
        </form>
    )
} 