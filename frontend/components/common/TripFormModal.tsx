"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Trip } from "@/types/trip"
import { Field, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format } from "date-fns"
import { IconCalendar } from "@tabler/icons-react"
import { DateRange } from "react-day-picker"

interface TripFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    onSubmit: (trip: TripFormState) => void
    submitText: string
    initialData?: Trip
}

interface TripFormState {
    name: string
    description: string
    date: DateRange
}

export function TripFormModal({ open, onOpenChange, title, onSubmit, submitText, initialData }: TripFormModalProps) {
    const [state, setState] = useState<TripFormState>({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        date: {
            from: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
            to: initialData?.endDate ? new Date(initialData.endDate) : addDays(new Date(), 7),
        }
    })

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        onSubmit(state)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground">
                    Fields marked with <span className="text-red-500">*</span> are required
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 pb-4">
                        <div className="grid gap-3">
                            <Label htmlFor="trip-name">Trip Name <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                id="trip-name"
                                name="name"
                                value={state.name}
                                onChange={(e) => setState({ ...state, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="trip-description">Trip Description</Label>
                            <Textarea
                                id="trip-description"
                                name="description"
                                value={state.description}
                                onChange={(e) => setState({ ...state, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Field>
                                <FieldLabel htmlFor="date-picker-range">Trip Dates <span className="text-red-500">*</span></FieldLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date-picker-range"
                                            className="justify-start px-2.5 font-normal"
                                        >
                                            <IconCalendar />
                                            {state.date?.from ? (
                                                state.date.to ? (
                                                    <>
                                                        {format(state.date.from, "LLL dd, y")} -{" "}
                                                        {format(state.date.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(state.date.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="range"
                                            defaultMonth={state.date?.from}
                                            selected={state.date}
                                            onSelect={(date) => setState({ ...state, date })}
                                            numberOfMonths={2}
                                            disabled={{
                                                before: new Date()
                                            }}
                                            required
                                        />
                                    </PopoverContent>
                                </Popover>
                            </Field>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">{submitText}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
