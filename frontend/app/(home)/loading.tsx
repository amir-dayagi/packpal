import TripCardSkeleton from "../components/skeletons/TripCardSkeleton"

export default function Loading() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-end mb-4">
                    <button 
                        disabled
                        className="w-10 h-10 rounded-full bg-primary/50 text-background flex items-center justify-center cursor-not-allowed"
                        aria-label="Create new trip"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Show 6 skeleton cards */}
                    {[...Array(6)].map((_, i) => (
                        <TripCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    )
} 