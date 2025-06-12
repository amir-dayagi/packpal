'use client'

export default function PackingListItemSkeleton() {
    return (
        <div className="space-y-1 bg-tertiary rounded-lg p-4">
            <div className="flex items-center gap-4">
                {/* Item name */}
                <div className="flex-1 h-6 bg-secondary/20 rounded animate-pulse" />

                {/* Quantity display */}
                <div className="w-16 h-6 bg-secondary/20 rounded animate-pulse" />

                {/* Action buttons */}
                <div className="w-8 h-8 bg-secondary/20 rounded-md animate-pulse" />
                <div className="w-8 h-8 bg-secondary/20 rounded-md animate-pulse" />
                <div className="w-8 h-8 bg-secondary/20 rounded-md animate-pulse" />
                <div className="w-8 h-8 bg-secondary/20 rounded-md animate-pulse" />
            </div>

            {/* Notes row */}
            <div className="px-4 py-2">
                <div className="h-4 bg-secondary/20 rounded animate-pulse w-1/3" />
            </div>
        </div>
    )
} 