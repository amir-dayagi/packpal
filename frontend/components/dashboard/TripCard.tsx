"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardAction,
} from "@/components/ui/card"
import { Trip } from "@/types/trip"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconTrash, IconCalendar } from "@tabler/icons-react"
import { format } from "date-fns"
import { useModal } from "@/contexts/ModalContext"
import { ConfirmationModal } from "@/components/common/ConfirmationModal"
import { useTrips } from "@/hooks/useTrips"

interface TripCardProps {
    trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
    const { openModal } = useModal()
    const { deleteTrip } = useTrips()

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        openModal(ConfirmationModal, {
            title: "Delete Trip",
            description: `Are you sure you want to delete "${trip.name}"?`,
            confirmText: "Delete",
            onConfirm: () => {
                const request = {
                    tripId: trip.id
                }
                deleteTrip(request)
            }
        })
    }

    return (
        <Card
            size="sm"
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-accent bg-card"
        >
            <Link href={`/trip?tripId=${trip.id}`}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {trip.name}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={handleDelete}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconCalendar className="h-4 w-4 text-accent" />
                        <span>
                            {format(trip.startDate, "MMM d")} - {format(trip.endDate, "MMM d, yyyy")}
                        </span>
                    </div>
                    {trip.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {trip.description}
                        </p>
                    )}
                </CardContent>

            </Link>
        </Card>
    )
}
