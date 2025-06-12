import PackingListItemSkeleton from '../../components/skeletons/PackingListItemSkeleton'

export default function TripLoading() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header skeleton */}
                <div className="mb-8">
                    <div className="h-9 bg-secondary/20 rounded animate-pulse w-1/3 mb-2" />
                    <div className="h-5 bg-secondary/20 rounded animate-pulse w-1/4" />
                </div>

                <div className="space-y-8">
                    {/* Packing list section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-7 bg-secondary/20 rounded animate-pulse w-32" />
                            <div className="w-28 h-9 bg-secondary/20 rounded-lg animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <PackingListItemSkeleton key={i} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}