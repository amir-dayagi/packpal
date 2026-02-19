import { IconCheck, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useTrip } from "@/hooks/useTrip";
import { useTripId } from "@/hooks/useTripId";
import { TripStatus, UpdateTripRequest } from "@/types/trip";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useModal } from "@/contexts/ModalContext";

interface TravelingTripPageFooterProps {
    isFullyMarkedAsReturning: boolean
}

export default function TravelingTripPageFooter({ isFullyMarkedAsReturning }: TravelingTripPageFooterProps) {
    const tripId = useTripId()
    const { updateTrip } = useTrip(tripId)
    const router = useRouter()
    const { openModal } = useModal()

    const handleForgotSomething = () => {
        const request: UpdateTripRequest = {
            tripId,
            updates: {
                status: TripStatus.PACKING
            }
        }
        updateTrip(request)
    }

    const handleGoingHome = () => {
        const goHome = () => {
            const request: UpdateTripRequest = {
                tripId,
                updates: {
                    status: TripStatus.COMPLETED
                }
            }
            updateTrip(request)
            router.push("/dashboard")
        }

        if (!isFullyMarkedAsReturning) {
            openModal(ConfirmationModal, {
                title: "Going Home",
                description: "Are you sure you want to go home? You haven't marked all your items as returning.",
                confirmText: "Go Home",
                onConfirm: () => {
                    goHome()
                }
            })
        } else {
            goHome()
        }
    }

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50">
            <div className="container min-w-full h-full flex items-center justify-between px-8">
                <div className="flex gap-4">
                    <Button onClick={handleForgotSomething}>
                        <IconArrowLeft className="h-5 w-5" />
                        Forgot Something?
                    </Button>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleGoingHome}>
                        <IconCheck className="h-5 w-5" />
                        Going Home!
                    </Button>
                </div>
            </div>
        </footer>
    )
}
