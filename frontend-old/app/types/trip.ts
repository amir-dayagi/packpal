export enum TripStatus {
    PACKING = "packing",
    TRAVELING = "traveling",
    COMPLETED = "completed"
}

export interface Trip {
    id: number
    name: string
    description?: string
    startDate: string
    endDate: string
    createdAt: string
    status: TripStatus
}

export interface TripDTO {
    id: number
    name: string
    description?: string
    start_date: string
    end_date: string
    created_at: string
    user_id: string
    status: TripStatus
}

export interface TripResponse {
    trip: TripDTO
}

export interface TripListResponse {
    trips: TripDTO[]
}

export interface TripRequest {
    tripId: number
}

export interface CreateTripRequest {
    newTrip: {
        name: string
        description?: string
        startDate: string
        endDate: string
    }
}

export interface UpdateTripRequest {
    tripId: number
    updates: {
        name?: string
        description?: string
        startDate?: string
        endDate?: string
        status?: TripStatus
    }
}

export interface DeleteTripRequest {
    tripId: number
}

const tripMapper = (trip: TripDTO): Trip => {
    return {
        id: trip.id,
        name: trip.name,
        description: trip.description,
        startDate: trip.start_date,
        endDate: trip.end_date,
        createdAt: trip.created_at,
        status: trip.status
    }
}

export const tripResponseMapper = (tripResponse: TripResponse): Trip => {
    return tripMapper(tripResponse.trip)
}

export const tripListResponseMapper = (tripListResponse: TripListResponse): Trip[] => {
    return tripListResponse.trips.map(trip => tripMapper(trip))
}