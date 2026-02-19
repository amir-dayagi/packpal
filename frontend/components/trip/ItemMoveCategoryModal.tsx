import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { CategoryViewModel } from "@/types/category"

interface ItemMoveCategoryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: (category: CategoryViewModel | undefined) => void
    initialCategory: CategoryViewModel | undefined
    categories: CategoryViewModel[]
}

export function ItemMoveCategoryModal({ open, onOpenChange, title, description, onConfirm, initialCategory, categories }: ItemMoveCategoryModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<CategoryViewModel | undefined>(initialCategory)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onConfirm(selectedCategory)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        value={selectedCategory?.name || "Uncategorized"}
                        onValueChange={(value) => setSelectedCategory(categories.find((c) => c.name === value) || undefined)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                </SelectItem>
                            ))}
                            <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}