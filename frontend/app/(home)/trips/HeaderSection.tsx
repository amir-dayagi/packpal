import GradientButton from "@/app/components/GradientButton";

type HeaderSectionProps = {
    newTripAction: () => void;
    tripCount?: number;
}

export default function HeaderSection({
    newTripAction,
    tripCount
}: HeaderSectionProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">My Trips</h1>
                <p className="text-secondary">
                    {tripCount && tripCount > 0 
                        ? `${tripCount} ${tripCount === 1 ? 'trip' : 'trips'} planned`
                        : 'Plan your next adventure'
                    }
                </p>
            </div>
            {tripCount && tripCount > 0 ?
                <GradientButton
                    onClick={newTripAction}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>New Trip</span>
                </GradientButton>
                :
                <></>
            }
        </div>
    );
}