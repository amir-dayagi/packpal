export default function TripCardSkeleton() {
    return (
        <div className="block p-6 rounded-lg bg-tertiary relative animate-pulse">
            {/* Title skeleton */}
            <div className="h-7 bg-secondary/20 rounded-md w-3/4 mb-2"></div>
            
            {/* Description skeleton - two lines */}
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-secondary/20 rounded-md w-full"></div>
                <div className="h-4 bg-secondary/20 rounded-md w-2/3"></div>
            </div>
            
            {/* Date skeleton */}
            <div className="h-4 bg-secondary/20 rounded-md w-1/2"></div>
        </div>
    )
} 