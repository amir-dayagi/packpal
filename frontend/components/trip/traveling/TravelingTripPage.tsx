import { CategoryViewModel } from "@/types/category"
import { ItemViewModel } from "@/types/item"
import { PurchasedSection } from "@/components/trip/traveling/PurchasedSection"
import TravelingTripPageFooter from "@/components/trip/traveling/TravelingTripPageFooter"
import { ReturningSection } from "./ReturningSection"
import { TravelingPackedSection } from "./TravelingPackedSection"
import { useMemo } from "react"

interface TravelingTripPageProps {
    tripId: number
    packedSectionData: {
        groups: CategoryViewModel[]
        uncategorizedItems: ItemViewModel[]
    }
    purchasedSectionData: {
        groups: CategoryViewModel[]
        uncategorizedItems: ItemViewModel[]
    }
    returningSectionData: {
        groups: CategoryViewModel[]
        uncategorizedItems: ItemViewModel[]
    }
}

export function TravelingTripPage({ tripId, packedSectionData, purchasedSectionData, returningSectionData }: TravelingTripPageProps) {
    const isFullyMarkedAsReturning = useMemo(() => (
        packedSectionData.groups.every(group => group.items.length === 0)
        && packedSectionData.uncategorizedItems.length === 0
        && purchasedSectionData.groups.every(group => group.items.length === 0)
        && purchasedSectionData.uncategorizedItems.length === 0
    ), [packedSectionData, purchasedSectionData])

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-6">
                    <TravelingPackedSection
                        tripId={tripId}
                        groups={packedSectionData.groups}
                        uncategorizedItems={packedSectionData.uncategorizedItems}
                    />
                    <PurchasedSection
                        tripId={tripId}
                        groups={purchasedSectionData.groups}
                        uncategorizedItems={purchasedSectionData.uncategorizedItems}
                    />
                </div>
                <ReturningSection
                    tripId={tripId}
                    groups={returningSectionData.groups}
                    uncategorizedItems={returningSectionData.uncategorizedItems}
                />
            </div>
            <TravelingTripPageFooter isFullyMarkedAsReturning={isFullyMarkedAsReturning} />
        </>

    )
}