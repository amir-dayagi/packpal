export enum ItemOrigin {
    LISTED = "listed",
    PURCHASED = "purchased"
}

export interface Item {
    id: number
    tripId: number
    name: string
    notes?: string
    listQuantity?: number
    packedQuantity?: number
    returningQuantity?: number
    purchasedQuantity?: number
    categoryId?: number
    origin: ItemOrigin
}

export interface ItemViewModel {
    id: number
    name: string
    notes?: string
    quantity: number
    origin: ItemOrigin
}

export interface ItemDTO {
    id: number
    trip_id: number
    created_at: string
    name: string
    notes?: string
    list_quantity?: number
    packed_quantity?: number
    returning_quantity?: number
    purchased_quantity?: number
    category_id?: number
    origin: ItemOrigin
}

export interface ItemResponse {
    item: ItemDTO
}

export interface ItemListResponse {
    items: ItemDTO[]
}

export interface ItemRequest {
    itemId: number
}

export interface ItemListRequest {
    tripId: number
}

export interface CreateItemRequest {
    tripId: number
    newItem: {
        name: string
        origin: ItemOrigin
        quantity?: number
        notes?: string,
        categoryId?: number
    }
}

export interface UpdateItemRequest {
    itemId: number
    tripId: number
    updates: {
        name?: string
        categoryId?: number
        notes?: string
        quantity?: number
    }
}

export interface DeleteItemRequest {
    itemId: number
    tripId: number
}

export interface PackItemRequest {
    itemId: number
    tripId: number
    origin: ItemOrigin
    quantity?: number
    isEntireQuantity?: boolean
}

export interface UnpackItemRequest extends PackItemRequest { }

export interface MarkItemReturningRequest extends PackItemRequest { }

export interface UnmarkItemReturningRequest extends PackItemRequest { }

const itemMapper = (item: ItemDTO): Item => {
    return {
        id: item.id,
        tripId: item.trip_id,
        name: item.name,
        notes: item.notes,
        listQuantity: item.list_quantity,
        packedQuantity: item.packed_quantity,
        returningQuantity: item.returning_quantity,
        purchasedQuantity: item.purchased_quantity,
        categoryId: item.category_id,
        origin: item.origin
    }
}

export const itemResponseMapper = (itemResponse: ItemResponse): Item => {
    return itemMapper(itemResponse.item)
}

export const itemListResponseMapper = (itemListResponse: ItemListResponse): Item[] => {
    return itemListResponse.items.map(item => itemMapper(item))
}

export const itemViewModelMapper = (item: Item, quantityField: "listQuantity" | "packedQuantity" | "returningQuantity" | "purchasedQuantity"): ItemViewModel => {
    return {
        id: item.id,
        name: item.name,
        notes: item.notes,
        quantity: (item as any)[quantityField],
        origin: item.origin
    }
}