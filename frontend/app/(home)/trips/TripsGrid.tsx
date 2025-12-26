import { Trip } from "@/app/types/trip";
import TripCard from "./TripCard";
import GradientButton from "@/app/components/GradientButton";
import { Dispatch, SetStateAction } from "react";


type TripsGridProps = {
    trips?: Trip[];
    onTripCreate: () => void;
    setTripToDelete: Dispatch<SetStateAction<Trip | undefined>>;
}

export default function TripsGrid({trips, onTripCreate, setTripToDelete}: TripsGridProps) {
    return trips && trips.length > 0
        ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                    <TripCard 
                        key={trip.id} 
                        trip={trip} 
                        onTripDelete={() => setTripToDelete(trip)} 
                    />
                ))}
            </div>
        )
        : (
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-tertiary/50 shadow-lg p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-hover/20 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">No trips yet</h3>
                <p className="text-secondary mb-6 max-w-md mx-auto">
                    Start planning your next adventure by creating your first trip. PackPal will help you organize everything you need.
                </p>
                <GradientButton
                    onClick={onTripCreate}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Create Your First Trip</span>
                </GradientButton>
            </div>
    );
}