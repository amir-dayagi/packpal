import { apiClient } from "@/app_old/utils/apiClient"
import { CreateTripRequest, UpdateTripRequest, tripResponseMapper, tripListResponseMapper, DeleteTripRequest, TripRequest } from "../types/trip"

export const tripService = {
    getAll: async () => tripListResponseMapper(await apiClient.get("/trips")),

    get: async ({ tripId }: TripRequest) => tripResponseMapper(await apiClient.get(`/trips/${tripId}`)),

    create: async ({ newTrip }: CreateTripRequest) => {
        const newTripDTO = {
            name: newTrip.name,
            description: newTrip.description,
            start_date: newTrip.startDate,
            end_date: newTrip.endDate
        }
        const response = await apiClient.post("/trips", newTripDTO)
        return tripResponseMapper(response)
    },

    update: async ({ tripId, updates }: UpdateTripRequest) => {
        const updateTripDTO = {
            name: updates.name,
            description: updates.description,
            start_date: updates.startDate,
            end_date: updates.endDate,
            status: updates.status
        }
        const response = await apiClient.put(`/trips/${tripId}`, updateTripDTO)
        return tripResponseMapper(response)
    },

    delete: async ({ tripId }: DeleteTripRequest) => apiClient.delete(`/trips/${tripId}`),
}