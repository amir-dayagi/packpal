export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-tertiary">
            <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
    )
}