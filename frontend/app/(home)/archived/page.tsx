import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconArchive } from "@tabler/icons-react";
import Link from "next/link";

export default function ArchivedPage() {
    return (
        <div className="flex flex-col items-center justify-center flex-1 h-full gap-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="rounded-full bg-muted p-8 ring-1 ring-border shadow-lg">
                <IconArchive className="h-16 w-16 text-muted-foreground" stroke={1.5} />
            </div>

            <div className="max-w-[500px] space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Archived Trips</h1>
                <p className="text-muted-foreground text-lg">
                    We're working on a way to view your past adventures.
                    Check back soon to see your travel history!
                </p>
            </div>

            <div className="flex gap-4 mt-4">
                <Button asChild variant="outline">
                    <Link href="/dashboard" className="gap-2">
                        <IconArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    )
}