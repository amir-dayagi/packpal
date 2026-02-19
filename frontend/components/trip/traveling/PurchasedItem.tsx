"use client"

import { ItemViewModel } from "@/types/item"
import { useModal } from "@/contexts/ModalContext"
import { ItemFormModal } from "@/components/common/ItemFormModal"
import { ItemOrigin } from "@/types/item"
import { Button } from "../../ui/button"
import { IconEdit, IconArrowBack, IconTrash, IconArrowsMoveVertical } from "@tabler/icons-react"
import { ConfirmationModal } from "@/components/common/ConfirmationModal"
import { useItemActions } from "@/hooks/useItemActions"
import { DeleteItemRequest, MarkItemReturningRequest, UpdateItemRequest } from "@/types/item"
import { QuantityModal } from "../QuantityModal"

interface PurchasedItemProps {
    tripId: number
    item: ItemViewModel
    onMove: () => void
}

export function PurchasedItem({ item, tripId, onMove }: PurchasedItemProps) {
    const { openModal, closeModal } = useModal()
    const { deleteItem, markItemReturning, updateItem } = useItemActions()

    const handleEditItem = () => {
        openModal(ItemFormModal, {
            title: "Edit Item",
            submitText: "Edit",
            initialData: item,
            onSubmit: (itemState) => {
                const request: UpdateItemRequest = {
                    tripId,
                    itemId: item.id,
                    updates: {
                        name: itemState.name,
                        quantity: itemState.quantity,
                        notes: itemState.notes
                    }
                }
                updateItem(request, {
                    onSuccess: () => {
                        closeModal()
                    }
                })
            }
        })
    }

    const handleMarkItemReturning = () => {
        const markReturning = (quantity: number, isEntireQuantity: boolean) => {
            const request: MarkItemReturningRequest = {
                tripId: tripId,
                itemId: item.id,
                origin: ItemOrigin.PURCHASED,
                quantity: quantity,
                isEntireQuantity: isEntireQuantity
            }
            markItemReturning(request, {
                onSuccess: () => {
                    closeModal()
                }
            })
        }
        if (item.quantity > 1) {
            openModal(QuantityModal, {
                title: "Mark Item Returning",
                description: `How many "${item.name}" do you want to mark as returning?`,
                maxQuantity: item.quantity,
                onConfirm: markReturning
            })
        } else {
            markReturning(1, true)
        }
    }

    const handleDeleteItem = () => {
        openModal(ConfirmationModal, {
            title: "Delete Item",
            description: `Are you sure you want to delete "${item.name}"?`,
            confirmText: "Delete",
            onConfirm: () => {
                const request: DeleteItemRequest = {
                    tripId: tripId,
                    itemId: item.id
                }
                deleteItem(request)
            }
        })
    }

    return (
        <div className="group flex items-start gap-2 p-3 rounded-lg bg-card border hover:shadow-sm transition-all">
            <div className="flex-1 min-w-0 space-y-2">
                {/* Item Information */}
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{item.name}</span>
                </div>
                {item.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>
                )}
                <div className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                </div>
            </div>

            {/* Item Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={onMove}
                    title="Move item"
                >
                    <IconArrowsMoveVertical className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={handleEditItem}
                    title="Edit item"
                >
                    <IconEdit className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={handleMarkItemReturning}
                    disabled={item.quantity <= 0}
                    title="Mark item returning"
                >
                    <IconArrowBack className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDeleteItem}
                    title="Delete item"
                >
                    <IconTrash className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}