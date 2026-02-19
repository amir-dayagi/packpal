'use client'

import { useEffect, useState } from 'react'
import { ItemOrigin, CreateItemRequest, Item } from '@/app_old/types/item'
import Modal from '@/app_old/components/common/Modal'
import GradientButton from '@/app_old/components/common/GradientButton'
import { useItemActions } from '@/app_old/hooks/useItemActions'

interface QuantityModalProps {
    onClose: () => void,
    title: string
    onConfirm: (quantity: number, isEntireQuantity: boolean) => void,
    maxQuantity: number
}

export default function QuantityModal({ onClose, onConfirm, maxQuantity, title }: QuantityModalProps) {
    const [quantity, setQuantity] = useState(maxQuantity)
    const [isEntireQuantity, setIsEntireQuantity] = useState(quantity === maxQuantity)

    const onQuantityUpdate = (quantity: number) => {
        setQuantity(quantity)
        setIsEntireQuantity(quantity === maxQuantity)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onConfirm(quantity, isEntireQuantity)
        onClose()
    }

    const handleEntireQuantityCheckboxToggle = () => {
        setIsEntireQuantity(old => {
            setQuantity(old ? 1 : maxQuantity)
            return !old
        })

    }

    return (
        <Modal
            onClose={onClose}
            title={title}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <button
                            disabled={quantity <= 1}
                            type="button"
                            onClick={() => onQuantityUpdate(quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary/10 enabled:hover:bg-secondary/20 transition-colors"
                        >
                            −
                        </button>
                        <span className="text-2xl font-semibold text-foreground w-16 text-center">
                            {quantity}
                        </span>
                        <button
                            disabled={quantity >= maxQuantity}
                            type="button"
                            onClick={() => onQuantityUpdate(quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary/10 enabled:hover:bg-secondary/20 transition-colors"
                        >
                            +
                        </button>
                    </div>

                    <label>
                        <span className='text-lg font-semibold text-foreground w-16 text-center pr-4'>
                            Mark entire quantity?
                        </span>
                        <input
                            type="checkbox"
                            checked={isEntireQuantity}
                            onChange={handleEntireQuantityCheckboxToggle}
                            className='w-4 h-4'
                        />

                    </label>

                    <div className="text-sm text-secondary mb-6">
                        Available: {maxQuantity} {maxQuantity === 1 ? 'unit' : 'units'}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-tertiary/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary hover:text-foreground hover:bg-tertiary/50 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <GradientButton
                            type="submit"
                            size="sm"
                        >
                            {"Confirm"}
                        </GradientButton>
                    </div>


                </div>
            </form>
        </Modal>
    )
} 