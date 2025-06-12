export interface Item {
    id: number
    trip_id: number
    created_at: string
    name: string
    quantity: number
    is_packed: boolean
    is_returning: boolean
    notes?: string
}

export interface ItemRequest {
    trip_id: number
    name: string
    quantity: number
    notes?: string
}