'use client'

import { useEffect, useState } from 'react'
import { ItemOrigin, CreateItemRequest } from '@/app_old/types/item'
import Modal from '@/app_old/components/common/Modal'
import GradientButton from '@/app_old/components/common/GradientButton'
import { useItemActions } from '@/app_old/hooks/useItemActions'
import FormModal from '@/app_old/components/common/FormModal'

interface CreateItemModalProps {
    onClose: () => void,
    origin: ItemOrigin,
    categoryId?: number
}

export default function CreateItemModal({ onClose, origin, categoryId }: CreateItemModalProps) {
    const { createItem } = useItemActions()
    const [newItem, setNewItem] = useState<CreateItemRequest>({
        name: "",
        origin: origin,
        quantity: 1,
        notes: "",
        category_id: categoryId
    })
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        createItem(newItem)
        setIsLoading(false)
        onClose()
    }

    return (
        <FormModal
            onClose={onClose}
            title="Add Item"
            submitText="Add"
            isLoading={isLoading}
            handleSubmit={handleSubmit}
        >
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Item Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="name"
                        value={newItem.name}
                        onChange={(e) => setNewItem(oldItem => ({ ...oldItem, name: e.target.value }))}
                        className="block w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-tertiary/50 ring-1 ring-inset ring-border placeholder:text-secondary text-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all duration-200 outline-none"
                        placeholder="What do you need to pack?"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-foreground mb-2">
                    Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5V6.75a2.25 2.25 0 114.5 0v3.75m-4.5 0h9" />
                        </svg>
                    </div>
                    <input
                        type="number"
                        id="quantity"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(oldItem => ({ ...oldItem, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                        min="1"
                        className="block w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-tertiary/50 ring-1 ring-inset ring-border text-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all duration-200 outline-none"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                    Notes <span className="text-secondary text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-4.5A2.25 2.25 0 019 18.75V14.25m9-3.75h-2.25m-2.25 0h-2.25m-2.25 0H9m0 0v2.25m0-2.25v-2.25m0 0H6.75m2.25 0H9" />
                        </svg>
                    </div>
                    <textarea
                        id="notes"
                        value={newItem.notes}
                        onChange={(e) => setNewItem(oldItem => ({ ...oldItem, notes: e.target.value }))}
                        rows={3}
                        className="block w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-tertiary/50 ring-1 ring-inset ring-border placeholder:text-secondary text-foreground focus:ring-2 focus:ring-primary focus:bg-background transition-all duration-200 outline-none resize-none"
                        placeholder="Add any notes about this item..."
                    />
                </div>
            </div>
        </FormModal>
    )
} 