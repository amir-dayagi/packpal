"use client"

import GradientButton from "@/app_old/components/common/GradientButton"

type ListSectionHeaderProps = {
    title: string
    isAddItemAllowed: boolean
    onAddItem: () => void
}

export default function ListSectionHeader({
    title,
    isAddItemAllowed,
    onAddItem
}: ListSectionHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                </div>
                {isAddItemAllowed && (
                    <GradientButton
                        onClick={onAddItem}
                        size="sm"
                    >
                        + Add Item
                    </GradientButton>
                )}
            </div>
        </div>
    )
}