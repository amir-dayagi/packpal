import { CategoryViewModel } from "@/types/category"
import { ItemViewModel } from "@/types/item"
import { PlannedSection } from "@/components/trip/packing/PlannedSection"
import { PackingPackedSection } from "@/components/trip/packing/PackingPackedSection"
import PackingTripPageFooter from "@/components/trip/packing/PackingTripPageFooter"
import { useMemo } from "react"

interface PackingTripPageProps {
    tripId: number
    plannedSectionData: {
        groups: CategoryViewModel[]
        uncategorizedItems: ItemViewModel[]
    }
    packedSectionData: {
        groups: CategoryViewModel[]
        uncategorizedItems: ItemViewModel[]
    }
}

export function PackingTripPage({ tripId, plannedSectionData, packedSectionData }: PackingTripPageProps) {
    const isFullyPacked = useMemo(() => (
        plannedSectionData.groups.every(group => group.items.length === 0)
        && plannedSectionData.uncategorizedItems.length === 0
    ), [plannedSectionData])

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlannedSection
                    tripId={tripId}
                    groups={plannedSectionData.groups}
                    uncategorizedItems={plannedSectionData.uncategorizedItems}
                />
                <PackingPackedSection
                    tripId={tripId}
                    groups={packedSectionData.groups}
                    uncategorizedItems={packedSectionData.uncategorizedItems}
                />
            </div>
            <PackingTripPageFooter isFullyPacked={isFullyPacked} />
        </>
    )
}