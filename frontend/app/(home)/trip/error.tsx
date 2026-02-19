"use client"

export default function ErrorPage({ error }: { error: Error }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-tertiary">
            <h1 className="text-3xl font-bold text-foreground">Something went wrong!</h1>
            <p className="text-muted-foreground mt-1">{error.message}</p>
            <p className="text-muted-foreground mt-1">Please try again later.</p>

        </div>
    )
}