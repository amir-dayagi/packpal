"use client"

import TripsHeader from '@/app_old/components/dashboard/TripsHeader'
import TripsGrid from '@/app_old/components/dashboard/TripsGrid'

export default function TripsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-tertiary">
            <div className="px-4 sm:px-6 lg:px-8 py-12">
                <TripsHeader />
                <TripsGrid />
            </div>
        </div>
    )
}

