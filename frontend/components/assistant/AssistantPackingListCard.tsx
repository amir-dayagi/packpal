import { AssistantCategory, AssistantItem } from "@/types/assistant"
import { Dispatch, SetStateAction, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { AssistantCategory as AssistantCategoryComponent } from "./AssistantCategory"
import { AssistantItem as AssistantItemComponent } from "./AssistantItem"

interface AssistantPackingListCardProps {
    categories: AssistantCategory[]
    openCategories: Set<number>
    toggleCategory: (categoryId: number) => void
    setCategories: Dispatch<SetStateAction<AssistantCategory[]>>
    uncategorizedItems: AssistantItem[]
    setUncategorizedItems: Dispatch<SetStateAction<AssistantItem[]>>
}

export function AssistantPackingListCard({ categories, setCategories, uncategorizedItems, setUncategorizedItems, openCategories, toggleCategory }: AssistantPackingListCardProps) {


    const handleAddItem = (categoryId: number | null) => {
        const newItem: AssistantItem = {
            id: -Date.now(),
            name: "",
            quantity: 1,
            notes: ""
        };

        if (categoryId) {
            setCategories((prev) =>
                prev.map((c) =>
                    c.id === categoryId
                        ? { ...c, items: [...c.items, newItem] }
                        : c
                )
            );
        } else {
            setUncategorizedItems((prev) => [...prev, newItem]);
        }

        // Open the category if adding to one
        if (categoryId && !openCategories.has(categoryId)) {
            toggleCategory(categoryId);
        }
    };

    const handleUpdateItem = (itemId: number, field: keyof AssistantItem, value: string | number) => {
        setCategories((prev) =>
            prev.map((c) => ({
                ...c,
                items: c.items.map((item) =>
                    item.id === itemId ? { ...item, [field]: value } : item
                ),
            }))
        );

        setUncategorizedItems((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
            )
        );
    };

    const handleRemoveItem = (itemId: number) => {
        setCategories((prev) =>
            prev.map((c) => ({
                ...c,
                items: c.items.filter((item) => item.id !== itemId),
            }))
        );

        setUncategorizedItems((prev) =>
            prev.filter((item) => item.id !== itemId)
        );
    };

    const handleAddCategory = () => {
        const newCategory: AssistantCategory = {
            id: -Date.now(),
            name: "",
            items: []
        };

        setCategories((prev) => [...prev, newCategory]);
    };

    const handleUpdateCategory = (categoryId: number, field: keyof AssistantCategory, value: string) => {
        setCategories((prev) =>
            prev.map((c) =>
                c.id === categoryId ? { ...c, [field]: value } : c
            )
        );
    };

    const handleRemoveCategory = (categoryId: number) => {
        setCategories((prev) =>
            prev.filter((c) => c.id !== categoryId)
        );
    };

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Packing List</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem(null)} className="gap-1">
                        <IconPlus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 px-6 pb-6">
                <div className="space-y-4">
                    {/* Categories */}
                    {categories.map((category) => (
                        <AssistantCategoryComponent
                            key={category.id}
                            category={category}
                            isOpen={openCategories.has(category.id!)}
                            toggleCategory={toggleCategory}
                            handleAddItem={handleAddItem}
                            handleUpdateItem={handleUpdateItem}
                            handleDeleteItem={handleRemoveItem}
                        />
                    ))}

                    {/* Uncategorized */}
                    <div className="rounded-lg border bg-muted/30 p-3">
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
                                    <AssistantItemComponent
                                        key={item.id}
                                        item={item}
                                        handleUpdateItem={handleUpdateItem}
                                        handleDeleteItem={handleRemoveItem}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

    )
}    