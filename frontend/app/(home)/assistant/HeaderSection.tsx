import { Trip } from "@/app/types/trip";

export default function HeaderSection({ editedTrip }: { editedTrip: Trip | null }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">PackPal Assistant</h1>
                <p className="text-sm text-secondary mt-1">
                    Refine your trip plan and packing list with AI in real-time.
                </p>
            </div>
            {editedTrip && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-tertiary/60 text-xs text-secondary">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>Editing trip:</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">
                        {editedTrip.name}
                    </span>
                </div>
            )}
        </div>
    );
}