"use client"


import CreateItemModal from "./CreateItemModal"
import { Item, ItemOrigin } from "@/app_old/types/item"
import { ListSectionCategory, ListSectionType, useListSectionPresenter } from "@/app_old/hooks/useListSectionPresenter"
import { Category } from "@/app_old/types/category"
import ListSectionHeader from "./ListSectionHeader"
import GradientButton from "@/app_old/components/common/GradientButton"
import ListItem from "./ListItem"
import { useModal } from "@/app_old/hooks/useModal"
import { useTripId } from "@/app_old/hooks/useTripId"
import CategoryHeader from "./CategoryHeader"


type ListSectionProps = {
    listSectionType: ListSectionType,
}

export default function ListSection({
    listSectionType,
}: ListSectionProps) {
    const tripId = useTripId()
    const {
        title,
        categories,
        uncategorizedItems,
        isCreateAllowed,
        length,
        expandedCategories,
        toggleCategory,
        toggleUncategorized,
        isUncategorizedToggled,
        isLeftSideSection,
        tripStatus
    } = useListSectionPresenter(tripId, listSectionType)
    const { openModal } = useModal()

    const handleAddItem = (categoryId?: number) => {
        if (!isCreateAllowed) return

        openModal(CreateItemModal, {
            origin: listSectionType === ListSectionType.LISTED ? ItemOrigin.LISTED : ItemOrigin.PURCHASED,
            categoryId: categoryId
        })
    }

    return (
        <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            <ListSectionHeader
                title={title}
                isAddItemAllowed={isCreateAllowed && length > 0}
                onAddItem={() => handleAddItem()}
            />


            {/* Items List */}
            <div className="flex-1 overflow-y-auto">
                {length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 px-6 py-12">
                        <div className="text-center">
                            <p className="text-secondary text-lg">No items in {title}</p>
                            {isCreateAllowed && (
                                <>
                                    <p className="text-secondary/70 text-sm mt-2">
                                        Start by adding items to your list
                                    </p>
                                    <GradientButton
                                        onClick={() => handleAddItem()}
                                        className="mt-4"
                                    >
                                        Add Your First Item
                                    </GradientButton>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {/* Uncategorized */}
                        {uncategorizedItems.length > 0 && (
                            <div className="border-t border-border first:border-t-0">
                                <CategoryHeader
                                    name="Uncategorized"
                                    itemsCount={uncategorizedItems.length}
                                    isCreateAllowed={isCreateAllowed}
                                    toggleCollapse={() => toggleUncategorized()}
                                    isExpanded={isUncategorizedToggled}
                                    onAddItem={() => handleAddItem()}
                                />
                            </div>
                        )}


                        {/* Categories */}
                        {categories.map(category => (
                            <div key={category.id} className="border-t border-border first:border-t-0">
                                <CategoryHeader
                                    name={category.name}
                                    itemsCount={category.items.length}
                                    isCreateAllowed={isCreateAllowed}
                                    toggleCollapse={() => toggleCategory(category)}
                                    isExpanded={expandedCategories.includes(category.id)}
                                    onAddItem={() => handleAddItem(category.id)}
                                />

                                {/* Category Items */}
                                {expandedCategories.includes(category.id) && (
                                    <div className="divide-y divide-border/50">
                                        {category.items.map((item) => (
                                            <div key={item.id}>
                                                <ListItem
                                                    item={item}
                                                    tripId={tripId}
                                                    isCreateAllowed={isCreateAllowed}
                                                    listSectionType={listSectionType}
                                                    tripStatus={tripStatus}
                                                    isLeftSideItem={isLeftSideSection}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}