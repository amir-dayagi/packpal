import { AssistantCategory as IAssistantCategory, AssistantItem as IAssistantItem } from "@/types/assistant"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { IconPlus, IconChevronDown, IconChevronRight } from "@tabler/icons-react"
import { AssistantItem } from "./AssistantItem"

interface AssistantCategoryCardProps {
    category: IAssistantCategory
    isOpen: boolean
    toggleCategory: (categoryId: number) => void
    handleAddItem: (categoryId: number) => void
    handleUpdateItem: (itemId: number, field: keyof IAssistantItem, value: string | number) => void
    handleDeleteItem: (itemId: number) => void
}

export function AssistantCategory({ category, isOpen, toggleCategory, handleAddItem, handleUpdateItem, handleDeleteItem }: AssistantCategoryCardProps) {
    return (
        <Collapsible
            key={category.id}
            open={isOpen}
            onOpenChange={() => toggleCategory(category.id!)}
        >
            <div className="rounded-lg border bg-secondary/30">
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddItem(category.id!);
                            }}
                        >
                            <IconPlus className="h-4 w-4" />
                        </Button>
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
                                <AssistantItem
                                    key={item.id}
                                    item={item}
                                    handleUpdateItem={handleUpdateItem}
                                    handleDeleteItem={handleDeleteItem}
                                />
                            ))
                        )}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}