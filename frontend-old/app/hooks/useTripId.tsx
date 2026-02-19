import { useSearchParams } from "next/navigation"

export function useTripId() {
    const searchParams = useSearchParams()
    const tripId = Number(searchParams.get("tripId"))
    if (!tripId) {
        throw new Error("No tripId found")
    }
    return tripId
}