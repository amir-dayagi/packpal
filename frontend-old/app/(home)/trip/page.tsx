"use client"


import { TripStatus } from "@/app_old/types/trip";
import TripHeader from "@/app_old/components/trip/TripHeader";
import PackingTripPage from "@/app_old/components/trip/PackingTripPage";
import TravelingTripPage from "@/app_old/components/trip/TravelingTripPage";
import { useTrip } from "@/app_old/hooks/useTrip";
import { useTripId } from "@/app_old/hooks/useTripId";


export default function TripPage() {
    const tripId = useTripId()
    const { trip } = useTrip(tripId)

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
            <div className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <TripHeader />
                </div>


                {trip.status === TripStatus.PACKING ?
                    <PackingTripPage />
                    :
                    <TravelingTripPage />
                }

            </div>



        </div>
    )
}
