"use client"

import { ListSectionCategory } from "@/app_old/hooks/useListSectionPresenter";
import { useListSectionPresenter } from "@/app_old/hooks/useListSectionPresenter";


interface CategoryHeaderProps {
    name: string,
    itemsCount: number,
    isCreateAllowed: boolean,
    toggleCollapse: () => void,
    isExpanded: boolean,
    onAddItem: () => void
}

export default function CategoryHeader({ name, itemsCount, isCreateAllowed, toggleCollapse, isExpanded, onAddItem }: CategoryHeaderProps) {
    return (
        <div className="flex items-center gap-3 bg-secondary/5">
            <button
                onClick={() => toggleCollapse()}
                className="px-6 py-4 flex items-center justify-between hover:bg-secondary/10 transition-colors"
            >
                <div
                    className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                >
                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </button>
            <span className="font-semibold text-foreground">
                {name}
            </span>
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                {itemsCount}
            </span>
            <div className="flex-10" />
            {isCreateAllowed &&
                <button
                    onClick={onAddItem}
                    className="px-6 py-4 flex items-center justify-between hover:bg-secondary/10 transition-colors"
                >
                    +
                </button>
            }
        </div>
    )
}