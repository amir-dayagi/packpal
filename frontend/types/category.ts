import { ItemViewModel } from "@/types/item"

export interface Category {
    id: number
    name: string
    tripId: number
}

export interface CategoryViewModel {
    id: number
    name: string
    items: ItemViewModel[]
}

export interface CategoryDTO {
    id: number
    name: string
    trip_id: number
}

export interface CategoryResponse {
    category: CategoryDTO
}

export interface CategoryListResponse {
    categories: CategoryDTO[]
}

export interface CategoryListRequest {
    tripId: number
}

export interface CreateCategoryRequest {
    tripId: number
    newCategory: {
        name: string
    }
}

export interface UpdateCategoryRequest {
    categoryId: number
    tripId: number
    updates: {
        name: string
    }
}

export interface DeleteCategoryRequest {
    categoryId: number
    tripId: number
}

const categoryMapper = (category: CategoryDTO): Category => {
    return {
        id: category.id,
        name: category.name,
        tripId: category.trip_id
    }
}

export const categoryListResponseMapper = (categoryListResponse: CategoryListResponse): Category[] => {
    return categoryListResponse.categories.map(category => categoryMapper(category))
}

export const categoryResponseMapper = (categoryResponse: CategoryResponse): Category => {
    return categoryMapper(categoryResponse.category)
}

export const categoryViewModelMapper = (category: Category, items: ItemViewModel[]): CategoryViewModel => {
    return {
        id: category.id,
        name: category.name,
        items
    }
}