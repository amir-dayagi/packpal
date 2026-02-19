import GradientButton from "@/app_old/components/common/GradientButton";
import { useTrips } from "@/app_old/hooks/useTrips";
import { useModal } from "@/app_old/hooks/useModal";
import CreateTripModal from "./CreateTripModal";

export default function TripsHeader() {
    const { trips } = useTrips()
    const tripCount = trips.length
    const { openModal } = useModal()

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">My Trips</h1>
                <p className="text-secondary">
                    {tripCount
                        ? `${tripCount} ${tripCount === 1 ? 'trip' : 'trips'} planned`
                        : 'Plan your next adventure'
                    }
                </p>
            </div>
            {tripCount > 0 &&
                <GradientButton
                    onClick={() => openModal(CreateTripModal)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>New Trip</span>
                </GradientButton>
            }
        </div>
    );
}