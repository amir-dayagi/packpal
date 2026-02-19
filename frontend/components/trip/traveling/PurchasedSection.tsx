"use client"

import { CategoryViewModel } from "@/types/category"
import { CreateItemRequest, ItemOrigin, ItemViewModel, UpdateItemRequest } from "@/types/item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconShoppingBag, IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useModal } from "@/contexts/ModalContext"
import { ItemFormModal } from "@/components/common/ItemFormModal"
import { PurchasedCategory } from "@/components/trip/traveling/PurchasedCategory"
import { PurchasedItem } from "@/components/trip/traveling/PurchasedItem"
import { useItemActions } from "@/hooks/useItemActions"
import { ItemMoveCategoryModal } from "../ItemMoveCategoryModal"

interface PurchasedSectionProps {
    tripId: number
    groups: CategoryViewModel[]
    uncategorizedItems: ItemViewModel[]
}

export function PurchasedSection({ tripId, groups, uncategorizedItems }: PurchasedSectionProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const { openModal, closeModal } = useModal()
    const { createItem, updateItem } = useItemActions()

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const handleAddItem = (categoryId?: number) => {
        openModal(ItemFormModal, {
            title: "Add Item",
            submitText: "Add",
            onSubmit: (item) => {
                const request: CreateItemRequest = {
                    tripId,
                    newItem: {
                        name: item.name,
                        quantity: item.quantity,
                        notes: item.notes,
                        origin: ItemOrigin.PURCHASED,
                        categoryId
                    }
                }
                createItem(request, {
                    onSuccess: () => {
                        closeModal()
                        if (categoryId && !expandedCategories.has(categoryId)) {
                            toggleCategory(categoryId)
                        }
                    }
                })
            }
        })
    }

    const handleMoveItem = (item: ItemViewModel, currentCategory?: CategoryViewModel) => {
        openModal(ItemMoveCategoryModal, {
            title: `Move ${item.name}`,
            description: "To which category do you want to move this item?",
            categories: groups,
            initialCategory: currentCategory,
            onConfirm: (newCategory: CategoryViewModel | undefined) => {
                const request: UpdateItemRequest = {
                    tripId,
                    itemId: item.id,
                    updates: {
                        categoryId: newCategory?.id
                    }
                }
                updateItem(request, {
                    onSuccess: () => {
                        closeModal()
                        if (newCategory && !expandedCategories.has(newCategory.id)) {
                            toggleCategory(newCategory.id)
                        }
                        if (currentCategory && expandedCategories.has(currentCategory.id)) {
                            toggleCategory(currentCategory.id)
                        }
                    }
                })
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <IconShoppingBag className="h-5 w-5 text-primary" />
                        Purchased
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleAddItem()}
                    >
                        <IconPlus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {groups.map((group) => (
                    <PurchasedCategory
                        key={group.id}
                        tripId={tripId}
                        category={group}
                        isOpen={expandedCategories.has(group.id)}
                        toggleOpen={() => toggleCategory(group.id)}
                        onAddItem={() => handleAddItem(group.id)}
                        onMoveItem={(item) => handleMoveItem(item, group)}
                    />
                ))}

                <div
                    className="rounded-lg border bg-muted/30 p-3 transition-colors"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-muted-foreground">Uncategorized</span>
                        <span className="text-sm text-muted-foreground">
                            ({uncategorizedItems.length})
                        </span>
                    </div>
                    <div className="space-y-2">
                        {uncategorizedItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2 text-center">
                                No uncategorized items
                            </p>
                        ) : (
                            uncategorizedItems.map((item) => (
                                <PurchasedItem
                                    tripId={tripId}
                                    key={item.id}
                                    item={item}
                                    onMove={() => handleMoveItem(item, undefined)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}