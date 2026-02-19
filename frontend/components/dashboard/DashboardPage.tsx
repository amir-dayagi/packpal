"use client"

import { TripFormModal } from "@/components/common/TripFormModal"
import { Button } from "@/components/ui/button"
import { useModal } from "@/contexts/ModalContext"
import { IconPlus, IconSparkles } from "@tabler/icons-react"
import { TripsGrid } from "@/components/dashboard/TripsGrid"
import { useTrips } from "@/hooks/useTrips"
import { useRouter } from "next/navigation"
import { CreateTripRequest } from "@/types/trip"

export default function DashboardPage() {
    const { openModal, closeModal } = useModal()
    const { activeTrips: trips } = useTrips()
    const router = useRouter()
    const { createTrip } = useTrips()

    const handleCreateTrip = () => {
        openModal(TripFormModal, {
            title: "Create Trip",
            submitText: "Create",
            onSubmit: (data) => {

                const request: CreateTripRequest = {
                    newTrip: {
                        name: data.name,
                        description: data.description,
                        startDate: data.date.from!.toISOString().split("T")[0],
                        endDate: data.date.to!.toISOString().split("T")[0]
                    }
                }
                createTrip(request, {
                    onSuccess: () => {
                        closeModal()
                    }
                })
            }
        })
    }

    const handleCreateTripWithAssistant = () => {
        router.push("/assistant")
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Your Trips</h2>
                    <p className="text-muted-foreground mt-1">
                        Plan and manage your adventures
                    </p>
                </div>
                {trips.length > 0 &&
                    <div className="flex gap-6">
                        <Button
                            onClick={handleCreateTripWithAssistant}
                            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                        >
                            <IconSparkles className="h-5 w-5" />
                            Create Trip With AI
                        </Button>

                        <Button
                            onClick={handleCreateTrip}
                            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                        >
                            <IconPlus className="h-5 w-5" />
                            New Trip
                        </Button>
                    </div>
                }
            </div>

            <TripsGrid trips={trips} onCreateTrip={handleCreateTrip} onCreateTripWithAssistant={handleCreateTripWithAssistant} />
        </>
    );
}