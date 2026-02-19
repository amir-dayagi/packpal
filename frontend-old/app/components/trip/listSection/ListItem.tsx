"use client"

import DeleteConfirmationModal from "@/app_old/components/common/DeleteConfirmationModal"
import { useItemActions } from "@/app_old/hooks/useItemActions"
import { useModal } from "@/app_old/hooks/useModal"
import { Item, ItemOrigin } from "@/app_old/types/item"
import { useEffect, useRef, useState } from "react"
import QuantityModal from "./QuantityModal"
import { ListSectionItem, ListSectionType } from "@/app_old/hooks/useListSectionPresenter"
import { TripStatus } from "@/app_old/types/trip"

type ListItemProps = {
    item: ListSectionItem,
    tripId: number,
    isCreateAllowed: boolean,
    listSectionType: ListSectionType,
    tripStatus: TripStatus,
    isLeftSideItem: boolean
}

function EditableItemDetails({ item, tripId, isCreateAllowed }: Omit<ListItemProps, 'listSectionType' | 'tripStatus' | 'isLeftSideItem'>) {
    const { updateItem } = useItemActions();

    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [editedName, setEditedName] = useState(item.name)
    const [editedNotes, setEditedNotes] = useState(item.notes || "")

    const nameInputRef = useRef<HTMLInputElement>(null)
    const notesInputRef = useRef<HTMLTextAreaElement>(null)

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
            const request = {
                tripId: tripId,
                itemId: item.id,
                updates: {
                    name: trimmed
                }
            }
            updateItem(request)
        }
        setIsEditingName(false)
    }

    const handleNotesSubmit = () => {
        const trimmed = editedNotes.trim()
        if (trimmed !== (item.notes || '')) {
            const request = {
                tripId: tripId,
                itemId: item.id,
                updates: {
                    notes: trimmed
                }
            }
            updateItem(request)
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
        <div className="flex-1 min-w-0">
            {/* Name */}
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
                <button
                    disabled={!isCreateAllowed}
                    onClick={() => setIsEditingName(true)}
                    className="cursor-text font-medium transition-colors text-foreground hover:text-primary text-left w-full"
                >
                    {item.name}
                </button>
            )}

            {/* Notes */}
            {isEditingNotes ? (
                <textarea
                    ref={notesInputRef}
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    onKeyDown={handleNotesKeyDown}
                    onBlur={handleNotesSubmit}
                    className="w-full bg-transparent border-b border-tertiary outline-none text-sm text-secondary focus:border-primary-hover mt-2 resize-none"
                    rows={2}
                />
            ) : (
                <button
                    disabled={!isCreateAllowed}
                    onClick={() => setIsEditingNotes(true)}
                    className="cursor-text text-xs sm:text-sm text-secondary/80 hover:text-secondary transition-colors line-clamp-2 text-left w-full mt-1"
                >
                    {item.notes && item.notes.trim().length > 0 && isCreateAllowed
                        ? item.notes
                        : 'Add notes...'}
                </button>
            )}
        </div>
    )
}

function ItemQuantityControl({ item, tripId, isCreateAllowed, listSectionType, tripStatus }: Omit<ListItemProps, 'isLeftSideItem'>) {
    const { updateItem, markAsPacked, unmarkAsPacked } = useItemActions()
    const originQuantity = (item as any)[item.origin === ItemOrigin.LISTED ? "list_quantity" : "purchased_quantity"] || 0

    const handleQuantityChange = (quantityDiff: number) => {
        if (isCreateAllowed) {
            const request = {
                tripId: tripId,
                itemId: item.id,
                updates: {
                    quantity: item.quantity + quantityDiff
                }
            }
            updateItem(request)
        } else {
            const request = {
                tripId: tripId,
                itemId: item.id,
                origin: item.origin,
                isEntireQuantity: false,
                quantity: Math.abs(quantityDiff)
            }
            if (quantityDiff > 0) {
                markAsPacked(request)
            } else if (quantityDiff < 0) {
                unmarkAsPacked(request)
            }
        }
    }

    const showQuantityControl = listSectionType !== ListSectionType.PACKED && tripStatus !== TripStatus.TRAVELING

    return (
        <div className="flex items-center gap-3 flex-shrink-0 py-0.5">
            <div className="flex items-center gap-1 bg-secondary/10 rounded-lg px-2 py-1">
                {showQuantityControl && (
                    <button
                        disabled={isCreateAllowed && item.quantity <= 1}
                        onClick={() => handleQuantityChange(-1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-secondary enabled:hover:text-foreground enabled:hover:bg-background transition-all"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>
                )}
                <span className="w-8 text-center text-sm font-medium text-foreground">
                    {item.quantity}
                </span>
                {showQuantityControl && (
                    <button
                        disabled={!isCreateAllowed && originQuantity < 1}
                        onClick={() => handleQuantityChange(1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-secondary hover:text-foreground hover:bg-background transition-all"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    )
}

function EmptyItem({ item }: { item: ListSectionItem }) {
    return (
        <div className="px-6 py-4 hover:bg-secondary/5 transition-colors">
            <div className="flex items-start gap-4">
                <div className="font-medium text-secondary text-left w-full">
                    {item.name}
                </div>
            </div>
        </div>
    )
}

export default function ListItem({
    item,
    tripId,
    isCreateAllowed,
    listSectionType,
    tripStatus,
    isLeftSideItem
}: ListItemProps) {
    const { deleteItem, markAsPacked, unmarkAsPacked } = useItemActions();
    const { openModal } = useModal()

    const onPack = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        if (isCreateAllowed) {
            openModal(QuantityModal, {
                onConfirm: (quantity: number, isEntireQuantity: boolean) => {
                    const request = {
                        tripId: tripId,
                        itemId: item.id,
                        origin: item.origin,
                        isEntireQuantity: isEntireQuantity,
                        quantity: quantity
                    }
                    if (listSectionType === ListSectionType.LISTED) {
                        markAsPacked(request)
                    } else {
                        // TODO: handle markAsReturning
                    }
                },
                maxQuantity: item.quantity,
                title: isLeftSideItem ? "Pack" : "Return"
            })
        } else {
            if (listSectionType === ListSectionType.LISTED) {
                unmarkAsPacked({
                    tripId: tripId,
                    itemId: item.id,
                    origin: item.origin,
                    isEntireQuantity: true,
                })
            } else {
                // TODO: handle unMarkAsReturning
            }
        }
    }

    if (!item.quantity) {
        return (
            <EmptyItem item={item} />
        )
    }

    return (
        <div className="px-6 py-4 hover:bg-secondary/5 transition-colors">
            <div className="flex items-start gap-4">
                <EditableItemDetails
                    item={item}
                    tripId={tripId}
                    isCreateAllowed={isCreateAllowed}
                />

                <ItemQuantityControl
                    item={item}
                    tripId={tripId}
                    isCreateAllowed={isCreateAllowed}
                    listSectionType={listSectionType}
                    tripStatus={tripStatus}
                />

                {/* Pack/Unpack Button */}
                <button
                    onClick={onPack}
                    className={`p-2.5 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLeftSideItem ? "" : "rotate-180"}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8" />
                    </svg>
                </button>

                {/* Delete Button */}
                {isCreateAllowed && (
                    <button
                        onClick={() => openModal(DeleteConfirmationModal, {
                            message: `Are you sure you want to delete "${item.name}"? This will permanently delete the item and cannot be undone.`,
                            onConfirm: () => {
                                deleteItem({ tripId: tripId, itemId: item.id })
                            },
                            deleteItemName: item.name
                        })}
                        title="Delete item"
                        className="p-2.5 rounded-xl text-secondary hover:text-red-600 hover:bg-red-50/50 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}