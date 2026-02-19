import { AssistantTrip } from "@/types/assistant"
import { Dispatch, SetStateAction, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { IconCalendar } from "@tabler/icons-react"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { parseISO } from "date-fns"

interface AssistantTripCardProps {
    trip: AssistantTrip
    setTrip: Dispatch<SetStateAction<AssistantTrip>>
    onAccept: () => void
    isAcceptLoading: boolean
}

export function AssistantTripCard({ trip, setTrip, onAccept, isAcceptLoading }: AssistantTripCardProps) {
    const [editingField, setEditingField] = useState<string | null>(null)

    const isValid = trip.name && trip.start_date && trip.end_date

    return (
        <Card>
            <CardContent>
                <div className="space-y-2">
                    {/* Trip Name */}
                    <div className="flex items-center justify-between">
                        {editingField === "name" ? (
                            <Input
                                autoFocus
                                value={trip.name}
                                onChange={(e) => setTrip({ ...trip, name: e.target.value })}
                                onBlur={() => setEditingField(null)}
                                onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                                className="text-xl font-bold h-auto py-1 px-2 -ml-2"
                            />
                        ) : (
                            <h3
                                className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors px-2 -ml-2 py-1 rounded-md hover:bg-accent/50"
                                onClick={() => setEditingField("name")}
                            >
                                {trip.name}
                            </h3>
                        )}
                        {
                            isAcceptLoading ? (
                                <Button variant="default" size="sm" disabled>
                                    <Spinner data-icon="inline-start" />
                                    Accepting
                                </Button>
                            ) : (
                                <Button variant="default" size="sm" onClick={onAccept} disabled={!isValid}>
                                    Accept
                                </Button>
                            )
                        }
                    </div>
                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconCalendar className="h-3.5 w-3.5 flex-shrink-0" />
                        {editingField === "dates" ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    autoFocus
                                    type="date"
                                    value={trip.start_date ? parseISO(trip.start_date).toISOString().split("T")[0] : ""}
                                    onChange={(e) => setTrip({ ...trip, start_date: e.target.value })}
                                    className="h-7 text-sm w-auto"
                                />
                                <span>–</span>
                                <Input
                                    type="date"
                                    value={trip.end_date ? parseISO(trip.end_date).toISOString().split("T")[0] : ""}
                                    onChange={(e) => setTrip({ ...trip, end_date: e.target.value })}
                                    onBlur={() => setEditingField(null)}
                                    className="h-7 text-sm w-auto"
                                />
                            </div>
                        ) : (
                            <span
                                className="cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => setEditingField("dates")}
                            >
                                {trip.start_date ? parseISO(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "*"}
                                {" – "}
                                {trip.end_date ? parseISO(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "*"}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {editingField === "description" ? (
                        <Textarea
                            autoFocus
                            value={trip.description}
                            onChange={(e) => setTrip({ ...trip, description: e.target.value })}
                            onBlur={() => setEditingField(null)}
                            className="text-sm text-muted-foreground min-h-[40px] resize-none px-2 -ml-2"
                        />
                    ) : (
                        <p
                            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-2 -ml-2 py-1 rounded-md hover:bg-accent/50"
                            onClick={() => setEditingField("description")}
                        >
                            {trip.description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}