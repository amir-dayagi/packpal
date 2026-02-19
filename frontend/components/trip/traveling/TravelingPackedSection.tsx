import { CategoryViewModel } from "@/types/category"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconPackage } from "@tabler/icons-react"
import { ItemViewModel } from "@/types/item"
import { useState } from "react"
import { TravelingPackedItem } from "./TravelingPackedItem"
import { TravelingPackedCategory } from "./TravelingPackedCategory"

interface TravelingPackedSectionProps {
    tripId: number
    groups: CategoryViewModel[]
    uncategorizedItems: ItemViewModel[]
}

export function TravelingPackedSection({ tripId, groups, uncategorizedItems }: TravelingPackedSectionProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <IconPackage className="h-5 w-5 text-primary" />
                    Packed
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {groups.map((group) => (
                    <TravelingPackedCategory
                        key={group.id}
                        tripId={tripId}
                        category={group}
                        isOpen={expandedCategories.has(group.id)}
                        toggleOpen={() => toggleCategory(group.id)}
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
                                <TravelingPackedItem
                                    tripId={tripId}
                                    key={item.id}
                                    item={item}
                                />
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}