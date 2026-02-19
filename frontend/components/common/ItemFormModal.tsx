"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { ItemViewModel } from "@/types/item"
import { Textarea } from "@/components/ui/textarea"

interface ItemFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    onSubmit: (item: ItemFormState) => void
    submitText: string
    initialData?: ItemViewModel
}

interface ItemFormState {
    name: string
    quantity: number
    notes: string
}

export function ItemFormModal({ open, onOpenChange, title, onSubmit, submitText, initialData }: ItemFormModalProps) {
    const [state, setState] = useState<ItemFormState>({
        name: initialData?.name ?? "",
        quantity: initialData?.quantity ?? 1,
        notes: initialData?.notes ?? ""
    })

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        onSubmit(state)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground">
                    Fields marked with <span className="text-red-500">*</span> are required
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 pb-4">
                        <div className="grid gap-3">
                            <Label htmlFor="item-name">Item Name <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                id="item-name"
                                name="name"
                                value={state.name}
                                onChange={(e) => setState({ ...state, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="item-quantity">Item Quantity <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                type="number"
                                min={1}
                                id="item-quantity"
                                name="quantity"
                                value={state.quantity}
                                onChange={(e) => setState({ ...state, quantity: Number(e.target.value) })}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="item-notes">Item Notes (Optional)</Label>
                            <Textarea
                                id="item-notes"
                                name="notes"
                                value={state.notes}
                                onChange={(e) => setState({ ...state, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">{submitText}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

