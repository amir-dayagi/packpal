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
import { CategoryViewModel } from "@/types/category"

interface CategoryFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    onSubmit: (category: CategoryFormState) => void
    submitText: string
    initialData?: CategoryViewModel
}

interface CategoryFormState {
    name: string
}

export function CategoryFormModal({ open, onOpenChange, title, onSubmit, submitText, initialData }: CategoryFormModalProps) {
    const [state, setState] = useState<CategoryFormState>({
        name: initialData?.name || ""
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
                            <Label htmlFor="category-name">Category Name <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                id="category-name"
                                name="name"
                                value={state.name}
                                onChange={(e) => setState({ ...state, name: e.target.value })}
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
