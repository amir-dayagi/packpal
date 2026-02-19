import { CategoryViewModel } from "@/types/category"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"
import { PackingPackedItem } from "@/components/trip/packing/PackingPackedItem"

interface PackingPackedCategoryProps {
    tripId: number
    isOpen: boolean
    toggleOpen: () => void
    category: CategoryViewModel

}

export function PackingPackedCategory({ tripId, isOpen, toggleOpen, category }: PackingPackedCategoryProps) {
    return (
        <Collapsible
            open={isOpen}
            onOpenChange={toggleOpen}
        >
            <div className={`rounded-lg border bg-accent/10 transition-colors`}>
                <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/20 rounded-t-lg">
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
                                    <PackingPackedItem tripId={tripId} item={item} />
                                </div>
                            ))
                        )}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}