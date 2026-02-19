"use client"

import { TripInfo } from "@/components/trip/TripInfo"
import { useTrip } from "@/hooks/useTrip"
import { useTripId } from "@/hooks/useTripId"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useModal } from "@/contexts/ModalContext"
import { PackingTripPage } from "@/components/trip/packing/PackingTripPage"
import { TripStatus } from "@/types/trip"
import { CategoryFormModal } from "@/components/common/CategoryFormModal"
import { TravelingTripPage } from "@/components/trip/traveling/TravelingTripPage"
import { useCategoryActions } from "@/hooks/useCategoryActions"
import { CreateCategoryRequest } from "@/types/category"

export default function TripPage() {
    const router = useRouter()
    const tripId = useTripId()
    const {
        trip,
        plannedSectionData,
        packedSectionData,
        purchasedSectionData,
        returnedSectionData
    } = useTrip(tripId)
    const { openModal, closeModal } = useModal()
    const { createCategory } = useCategoryActions()

    const handleCreateCategory = () => {
        openModal(CategoryFormModal, {
            title: "Create Category",
            onSubmit: (category) => {
                const request: CreateCategoryRequest = {
                    tripId,
                    newCategory: {
                        name: category.name,
                    }
                }
                createCategory(request, {
                    onSuccess: () => {
                        closeModal()
                    }
                })
            },
            submitText: "Create"
        })
    }

    return (
        <div className="flex flex-col gap-6 pb-12 flex-1">
            {/* Back button */}
            <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="w-fit text-muted-foreground hover:text-foreground"
            >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            {/* Trip info */}
            <TripInfo trip={trip} />

            {/* Create category button */}
            <div className="flex gap-4">
                <Button
                    onClick={handleCreateCategory}
                    variant="outline"
                    className="gap-2"
                >
                    <IconPlus className="h-4 w-4" />
                    Create Category
                </Button>
            </div>

            {/* Lists sections */}
            {trip.status === TripStatus.PACKING
                ? (
                    <PackingTripPage
                        tripId={tripId}
                        plannedSectionData={plannedSectionData}
                        packedSectionData={packedSectionData}
                    />
                )
                : (
                    <TravelingTripPage
                        tripId={tripId}
                        packedSectionData={packedSectionData}
                        purchasedSectionData={purchasedSectionData}
                        returningSectionData={returnedSectionData}
                    />
                )}
        </div>
    )
}