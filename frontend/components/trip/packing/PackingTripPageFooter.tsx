import { IconLuggage } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useTrip } from "@/hooks/useTrip";
import { useTripId } from "@/hooks/useTripId";
import { TripStatus, UpdateTripRequest } from "@/types/trip";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useModal } from "@/contexts/ModalContext";

interface PackingTripPageFooterProps {
    isFullyPacked: boolean
}

export default function PackingTripPageFooter({ isFullyPacked }: PackingTripPageFooterProps) {
    const tripId = useTripId()
    const { updateTrip } = useTrip(tripId)
    const { openModal } = useModal()

    const handleCloseSuitcase = () => {
        const closeSuitcase = () => {
            const request: UpdateTripRequest = {
                tripId,
                updates: {
                    status: TripStatus.TRAVELING
                }
            }
            updateTrip(request)
        }

        if (!isFullyPacked) {
            openModal(ConfirmationModal, {
                title: "Close Suitcase",
                description: "Are you sure you want to close your suitcase? You haven't packed all your items.",
                confirmText: "Close Suitcase",
                onConfirm: () => {
                    closeSuitcase()
                }
            })
        } else {
            closeSuitcase()
        }
    }

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50">
            <div className="container min-w-full h-full flex items-center justify-end px-8">
                <div className="flex gap-4">
                    <Button onClick={handleCloseSuitcase}>
                        <IconLuggage className="h-5 w-5" />
                        Close Suitcase
                    </Button>
                </div>
            </div>
        </footer>
    )
}
