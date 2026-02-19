"use client"

import { Button } from "@/components/ui/button"
import { IconMapPin, IconPlus, IconSparkles } from "@tabler/icons-react"
import { Trip } from "@/types/trip"
import { TripCard } from "@/components/dashboard/TripCard"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TripsGridProps {
    trips: Trip[]
    onCreateTrip: () => void
    onCreateTripWithAssistant: () => void
}

export function TripsGrid({ trips, onCreateTrip, onCreateTripWithAssistant }: TripsGridProps) {
    if (trips.length === 0) {
        return (
            <ScrollArea className="flex-1 overflow-y-auto">
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <IconMapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        No trips yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Start planning your next adventure by creating your first trip.
                    </p>
                    <Button
                        onClick={onCreateTripWithAssistant}
                        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all mb-4"
                    >
                        <IconSparkles className="h-5 w-5" />
                        Create Trip With AI
                    </Button>
                    <Button
                        onClick={onCreateTrip}
                        className="gap-2 bg-primary hover:bg-primary/90"
                    >
                        <IconPlus className="h-5 w-5" />
                        Create Your Trip Manually
                    </Button>
                </div>
            </ScrollArea>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
            ))}
        </div>
    )
}