import { useSuspenseQuery } from "@tanstack/react-query"
import { Category } from "@/app_old/types/category"
import { categoryService } from "@/app_old/services/categoryService"
import { itemService } from "@/app_old/services/itemService"
import { Item, ItemOrigin } from "@/app_old/types/item"
import { useTrip } from "./useTrip"
import { TripStatus } from "../types/trip"
import { useState } from "react"

export const enum ListSectionType {
    LISTED = "Listed",
    PACKED = "Packed",
    PURCHASED = "Purchased",
    RETURNING = "Returning"
}

export interface ListSectionCategory {
    id: number
    name: string
    items: ListSectionItem[]
}

export interface ListSectionItem {
    id: number
    name: string
    notes?: string
    quantity: number
    origin: ItemOrigin
}

export const useListSectionPresenter = (tripId: number, sectionType: ListSectionType) => {
    const { data: items } = useSuspenseQuery<Item[]>({
        queryKey: ['items', tripId],
        queryFn: () => itemService.getAll({ tripId })
    })

    const { data: categories } = useSuspenseQuery<Category[]>({
        queryKey: ['categories', tripId],
        queryFn: () => categoryService.getAll({ tripId })
    })

    const { trip } = useTrip(tripId)

    const [expandedCategories, setExpandedCategories] = useState((categories || []).map(category => (category.id)))
    const [isUncategorizedToggled, setIsUncategorizedToggled] = useState(false)

    const toggleCategory = (category: ListSectionCategory) => {
        setExpandedCategories((prev) =>
            prev.includes(category.id)
                ? prev.filter((cid) => cid !== category.id)
                : [...prev, category.id]
        )
    }

    const toggleUncategorized = () => {
        setIsUncategorizedToggled((prev) => !prev)
    }

    if (trip.status === TripStatus.PACKING && (sectionType === ListSectionType.PURCHASED || sectionType === ListSectionType.RETURNING)) {
        throw new Error('Cannot access purchased or returning items in packing status')
    }

    if (trip.status === TripStatus.TRAVELING && sectionType === ListSectionType.LISTED) {
        throw new Error('Cannot access listed items in traveling status')
    }

    const relevantQuantity = {
        [ListSectionType.LISTED]: 'listQuantity',
        [ListSectionType.PACKED]: 'packedQuantity',
        [ListSectionType.PURCHASED]: 'purchasedQuantity',
        [ListSectionType.RETURNING]: 'returningQuantity'
    }[sectionType]

    const isLeftSideSection = sectionType === ListSectionType.LISTED || sectionType === ListSectionType.PURCHASED || (sectionType === ListSectionType.PACKED && trip.status === TripStatus.TRAVELING)

    const categoriesWithItems: ListSectionCategory[] = categories.map((category) => ({
        id: category.id,
        name: category.name,
        items: items.filter(item => item.categoryId === category.id && (isLeftSideSection || (item as any)[relevantQuantity] > 0)).map(item => ({
            id: item.id,
            name: item.name,
            notes: item.notes,
            quantity: (item as any)[relevantQuantity] || 0,
            origin: item.origin
        }))
    }))

    const uncategorizedItems = items.filter(item => item.categoryId === null && (isLeftSideSection || (item as any)[relevantQuantity] > 0)).map(item => ({
        id: item.id,
        name: item.name,
        notes: item.notes,
        quantity: (item as any)[relevantQuantity] || 0,
        origin: item.origin
    }))
    console.log(uncategorizedItems)

    const length = categoriesWithItems.reduce((acc, category) => acc + category.items.length, 0) + uncategorizedItems.length

    return {
        title: sectionType,
        categories: categoriesWithItems,
        uncategorizedItems: uncategorizedItems,
        isCreateAllowed: sectionType === ListSectionType.LISTED || sectionType === ListSectionType.PURCHASED,
        length: length,
        isLeftSideSection,
        expandedCategories,
        toggleCategory,
        toggleUncategorized,
        isUncategorizedToggled,
        tripStatus: trip.status
    }
}