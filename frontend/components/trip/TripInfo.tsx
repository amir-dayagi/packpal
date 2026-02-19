"use client"

import { DeleteTripRequest, Trip } from "@/types/trip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconCalendar, IconEdit, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useModal } from "@/contexts/ModalContext"
import { useTrips } from "@/hooks/useTrips"
import { ConfirmationModal } from "@/components/common/ConfirmationModal"
import { TripFormModal } from "@/components/common/TripFormModal"
import { useTrip } from "@/hooks/useTrip"
import { UpdateTripRequest } from "@/types/trip"


interface TripInfoProps {
    trip: Trip
}

export function TripInfo({ trip }: TripInfoProps) {
    const { openModal, closeModal } = useModal()
    const { deleteTrip } = useTrips()
    const { updateTrip } = useTrip(trip.id)

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault()
        openModal(TripFormModal, {
            initialData: trip,
            title: "Edit Trip",
            submitText: "Update",
            onSubmit: (data) => {
                const request: UpdateTripRequest = {
                    tripId: trip.id,
                    updates: {
                        name: data.name,
                        description: data.description,
                        startDate: data.date?.from?.toISOString().split("T")[0],
                        endDate: data.date?.to?.toISOString().split("T")[0]
                    }
                }
                updateTrip(request, {
                    onSuccess: () => {
                        closeModal()
                    }
                })
            }
        })
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        openModal(ConfirmationModal, {
            title: "Delete Trip",
            description: `Are you sure you want to delete "${trip.name}"?`,
            confirmText: "Delete",
            onConfirm: () => {
                const request: DeleteTripRequest = {
                    tripId: trip.id
                }
                deleteTrip(request, {
                    onSuccess: () => {
                        closeModal()
                    }
                })
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-bold pb-2">{trip.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IconCalendar className="h-4 w-4 text-accent" />
                            <span>
                                {format(trip.startDate, "MMM d")} - {format(trip.endDate, "MMM d, yyyy")}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="gap-2"
                        >
                            <IconEdit className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <IconTrash className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardHeader>
            {trip.description && (
                <CardContent className="pt-0">
                    <p className="text-muted-foreground">{trip.description}</p>
                </CardContent>
            )}
        </Card>

    )
}