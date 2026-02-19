"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Category, CreateCategoryRequest, UpdateCategoryRequest, DeleteCategoryRequest } from "@/types/category"
import { categoryService } from "@/services/categoryService"
import { toast } from "sonner"

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
            queryClient.setQueryData(['categories', tripId], (old: Category[]) => ([...(old || []), newCategory]))

            return { previousCategories }
        },
        onError: (error, createCategoryRequest, context) => {
            toast.error("Failed to create category")
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories', createCategoryRequest.tripId], context.previousCategories)
            }
        },
        onSuccess: () => {
            toast.success("Category created successfully")
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
            queryClient.setQueryData(['categories', tripId], (old: Category[]) => old.map((category) =>
                category.id === categoryId ? updatedCategory : category
            ))

            return { previousCategories }
        },
        onError: (error, updateCategoryRequest, context) => {
            toast.error("Failed to update category")
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories', updateCategoryRequest.tripId], context.previousCategories)
            }
        },
        onSuccess: () => {
            toast.success("Category updated successfully")
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

            queryClient.setQueryData(['categories', tripId], (old: Category[]) => old.filter((category) => category.id !== categoryId))

            return { previousCategories }
        },
        onError: (error, deleteCategoryRequest, context) => {
            toast.error("Failed to delete category")
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories', deleteCategoryRequest.tripId], context.previousCategories)
            }
        },
        onSuccess: () => {
            toast.success("Category deleted successfully")
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
