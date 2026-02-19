"use client"

import { useSearchParams } from "next/navigation"

export function useTripId() {
    const searchParams = useSearchParams()
    if (!searchParams) {
        throw new Error("No search params found")
    }
    const tripId = Number(searchParams.get("tripId"))
    if (!tripId) {
        throw new Error("No tripId found")
    }
    return tripId
}