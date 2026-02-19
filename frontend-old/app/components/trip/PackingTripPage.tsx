"use client"

import GradientButton from "@/app_old/components/common/GradientButton"
import { useTrip } from "@/app_old/hooks/useTrip"
import { TripStatus } from "@/app_old/types/trip"
import { useTripId } from "@/app_old/hooks/useTripId"
import { ListSectionType } from "@/app_old/hooks/useListSectionPresenter"
import ListSection from "./listSection/ListSection"

export default function PackingTripPage() {
    const tripId = useTripId()
    const { updateTrip } = useTrip(tripId)
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ListSection
                    listSectionType={ListSectionType.LISTED}
                />
                <ListSection
                    listSectionType={ListSectionType.PACKED}
                />
            </div>

            <GradientButton
                onClick={() => { updateTrip({ updates: { status: TripStatus.TRAVELING } }) }}
                size="lg"
                className="fixed bottom-4 right-4 bg-primary text-primary-foreground m-10 rounded-xl hover:bg-primary/90 transition-colors"
            >
                Close The Suitcase
            </GradientButton>
        </>
    )
}