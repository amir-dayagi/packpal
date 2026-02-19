import { apiClient } from "@/lib/apiClient"
import { CategoryListRequest, categoryListResponseMapper, categoryResponseMapper, CreateCategoryRequest, DeleteCategoryRequest, UpdateCategoryRequest } from "@/types/category"

export const categoryService = {
    getAll: async ({ tripId }: CategoryListRequest) => {
        const response = await apiClient.get(`/trips/${tripId}/categories`)
        return categoryListResponseMapper(response)
    },

    create: async ({ tripId, newCategory }: CreateCategoryRequest) => {
        const newCategoryDTO = {
            name: newCategory.name,
            trip_id: tripId
        }
        const response = await apiClient.post("/categories", newCategoryDTO)
        return categoryResponseMapper(response)
    },

    update: async ({ categoryId, updates }: UpdateCategoryRequest) => {
        const updateCategoryDTO = {
            name: updates.name,
            category_id: categoryId
        }
        const response = await apiClient.put(`/categories/${categoryId}`, updateCategoryDTO)
        return categoryResponseMapper(response)
    },

    delete: async ({ categoryId }: DeleteCategoryRequest) => apiClient.delete(`/categories/${categoryId}`),
}