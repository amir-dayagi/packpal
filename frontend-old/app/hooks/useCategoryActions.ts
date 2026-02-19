import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Category, CreateCategoryRequest, UpdateCategoryRequest, DeleteCategoryRequest } from "@/app_old/types/category"
import { categoryService } from "@/app_old/services/categoryService"

export const useCategoryActions = () => {
    const queryClient = useQueryClient()

    const createCategory = useMutation({
        mutationFn: async (createCategoryRequest: CreateCategoryRequest) => await categoryService.create(createCategoryRequest),
        onMutate: async (createCategoryRequest: CreateCategoryRequest) => {
            const tripId = createCategoryRequest.tripId

            await queryClient.cancelQueries({ queryKey: ['categories', tripId] })
            const previousCategories = queryClient.getQueryData(['categories', tripId])

            const newCategory: Category = {
                ...createCategoryRequest.newCategory,
                id: Date.now(),
                tripId: tripId
            }
            queryClient.setQueryData(['categories', tripId], (old: { categories: Category[] }) => ({
                categories: [...(old?.categories || []), newCategory],
            }))

            return { previousCategories }
        },
        onError: (error, createCategoryRequest, context) => {
            console.error('Error creating category:', error)
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories', createCategoryRequest.tripId], context.previousCategories)
            }
        },
        onSettled: (data, error, createCategoryRequest) => {
            queryClient.invalidateQueries({ queryKey: ['categories', createCategoryRequest.tripId] })
        },
    })

    const updateCategory = useMutation({
        mutationFn: async (updateCategoryRequest: UpdateCategoryRequest) => await categoryService.update(updateCategoryRequest),
        onMutate: async (updateCategoryRequest: UpdateCategoryRequest) => {
            const tripId = updateCategoryRequest.tripId
            const categoryId = updateCategoryRequest.categoryId

            await queryClient.cancelQueries({ queryKey: ['categories', tripId] })
            const previousCategories = queryClient.getQueryData(['categories', tripId])

            const updatedCategory: Category = {
                ...updateCategoryRequest.updates,
                id: categoryId,
                tripId: tripId
            }
            queryClient.setQueryData(['categories', tripId], (old: { categories: Category[] }) => ({
                categories: old.categories.map((category) =>
                    category.id === categoryId ? updatedCategory : category
                )
            }))

            return { previousCategories }
        },
        onError: (error, updateCategoryRequest, context) => {
            console.error('Error updating category:', error)
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories', updateCategoryRequest.tripId], context.previousCategories)
            }
        },
        onSettled: (data, error, updateCategoryRequest) => {
            queryClient.invalidateQueries({ queryKey: ['categories', updateCategoryRequest.tripId] })
        },
    })

    const deleteCategory = useMutation({
        mutationFn: async (deleteCategoryRequest: DeleteCategoryRequest) => await categoryService.delete(deleteCategoryRequest),
        onMutate: async (deleteCategoryRequest: DeleteCategoryRequest) => {
            const tripId = deleteCategoryRequest.tripId
            const categoryId = deleteCategoryRequest.categoryId

            await queryClient.cancelQueries({ queryKey: ['categories', tripId] })
            const previousCategories = queryClient.getQueryData(['categories', tripId])

            queryClient.setQueryData(['categories', tripId], (old: { categories: Category[] }) => ({
                categories: (old?.categories || []).filter((category) => category.id !== categoryId),
            }))

            return { previousCategories }
        },
        onError: (error, deleteCategoryRequest, context) => {
            console.error('Error deleting category:', error)
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories', deleteCategoryRequest.tripId], context.previousCategories)
            }
        },
        onSettled: (data, error, deleteCategoryRequest) => {
            queryClient.invalidateQueries({ queryKey: ['categories', deleteCategoryRequest.tripId] })
        },
    })

    return {
        createCategory: createCategory.mutate,
        updateCategory: updateCategory.mutate,
        deleteCategory: deleteCategory.mutate,
    }
}
