export interface Trip {
    id: number
    name: string
    description: string
    start_date: string
    end_date: string
    created_at: string
    user_id: string
}

export interface TripRequest {
    name: string
    description?: string
    start_date: string
    end_date: string
}