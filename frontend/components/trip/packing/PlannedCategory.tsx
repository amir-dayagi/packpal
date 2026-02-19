import { CategoryViewModel } from "@/types/category"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { IconChevronDown, IconChevronRight, IconPlus, IconTrash, IconEdit } from "@tabler/icons-react"
import { PlannedItem } from "@/components/trip/packing/PlannedItem"
import { useModal } from "@/contexts/ModalContext"
import { ConfirmationModal } from "@/components/common/ConfirmationModal"
import { useCategoryActions } from "@/hooks/useCategoryActions"
import { DeleteCategoryRequest, UpdateCategoryRequest } from "@/types/category"
import { CategoryFormModal } from "@/components/common/CategoryFormModal"
import { ItemViewModel } from "@/types/item"

interface PlannedCategoryProps {
    tripId: number
    isOpen: boolean
    toggleOpen: () => void
    category: CategoryViewModel
    onAddItem: () => void
    onMoveItem: (item: ItemViewModel) => void
}

export function PlannedCategory({ tripId, isOpen, toggleOpen, category, onAddItem, onMoveItem }: PlannedCategoryProps) {
    const { openModal, closeModal } = useModal()
    const { deleteCategory, updateCategory } = useCategoryActions()

    const handleAddItem = (e: React.MouseEvent) => {
        e.stopPropagation()
        onAddItem()
    }

    const handleEditCategory = (e: React.MouseEvent) => {
        e.stopPropagation()
        openModal(CategoryFormModal, {
            title: "Edit Category",
            initialData: category,
            onSubmit: (categoryState) => {
                const request: UpdateCategoryRequest = {
                    categoryId: category.id,
                    tripId: tripId,
                    updates: {
                        name: categoryState.name,
                    }
                }
                updateCategory(request, {
                    onSuccess: () => {
                        closeModal()
                    }
                })
            },
            submitText: "Edit"
        })
    }

    const handleDeleteCategory = (e: React.MouseEvent) => {
        e.stopPropagation()
        openModal(ConfirmationModal, {
            title: "Delete Category",
            description: `Are you sure you want to delete "${category.name}"? All items in this category will be deleted as well.`,
            confirmText: "Delete",
            onConfirm: () => {
                const request: DeleteCategoryRequest = {
                    categoryId: category.id,
                    tripId: tripId
                }
                deleteCategory(request, {
                    onSuccess: () => {
                        closeModal()
                    }
                })
            }
        })
    }

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={toggleOpen}
        >
            <div className={`rounded-lg border bg-secondary/30 transition-colors`}>
                <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/50 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            {isOpen ? (
                                <IconChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">
                                ({category.items.length})
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleEditCategory}
                            >
                                <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleAddItem}
                            >
                                <IconPlus className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={handleDeleteCategory}
                            >
                                <IconTrash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-2">
                        {category.items.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2 text-center">
                                No items in this category
                            </p>
                        ) : (
                            category.items.map((item) => (
                                <div key={item.id}>
                                    <PlannedItem tripId={tripId} item={item} onMove={() => onMoveItem(item)} />
                                </div>
                            ))
                        )}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}