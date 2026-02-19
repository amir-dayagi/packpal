"use client"

import { ItemViewModel } from "@/types/item"
import { Button } from "../../ui/button"
import { IconX } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { useModal } from "@/contexts/ModalContext"
import { QuantityModal } from "../QuantityModal"
import { UnmarkItemReturningRequest } from "@/types/item"
import { useItemActions } from "@/hooks/useItemActions"

interface ReturningItemProps {
    tripId: number
    item: ItemViewModel
}

export function ReturningItem({ tripId, item }: ReturningItemProps) {
    const { openModal, closeModal } = useModal()
    const { unmarkItemReturning } = useItemActions()

    const handleUnmarkReturning = () => {
        const unmarkReturning = (quantity: number, isEntireQuantity: boolean) => {
            const request: UnmarkItemReturningRequest = {
                tripId: tripId,
                itemId: item.id,
                origin: item.origin,
                quantity: quantity,
                isEntireQuantity: isEntireQuantity
            }
            unmarkItemReturning(request, {
                onSuccess: () => {
                    closeModal()
                }
            })
        }
        if (item.quantity > 1) {
            openModal(QuantityModal, {
                title: "Unmark Returning",
                description: `How many "${item.name}" do you want to unmark as returning?`,
                maxQuantity: item.quantity,
                onConfirm: unmarkReturning
            })
        } else {
            unmarkReturning(1, true)
        }
    }

    return (
        <div className="group flex items-center gap-3 p-3 rounded-lg bg-card border">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{item.name}</span>
                    <Badge variant="outline" className="text-xs bg-accent/20 text-accent-foreground border-accent/30">
                        {item.quantity} returning
                    </Badge>
                </div>
                {item.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {item.notes}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={handleUnmarkReturning}
                    title="Unmark returning"
                >
                    <IconX className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}