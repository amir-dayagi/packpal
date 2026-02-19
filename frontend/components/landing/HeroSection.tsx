import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HeroSection() {
    return (
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <Badge variant="secondary" className="rounded-2xl px-4 py-1.5 text-sm font-medium">
                    🧳 PackPal: Your Smart Travel Companion
                </Badge>
                <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    Your Trip Starts with <br className="hidden sm:inline" />
                    a Conversation
                </h1>
                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    Chat with PackPal to create smart, initial lists instantly. Plan, pack, track what you bought, and remember what you're bringing back. The only packing list that understands your journey.
                </p>
                <div className="space-x-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <Link href="/signup">
                        <Button size="lg" className="h-11 px-8">
                            Start Creating My Trip
                        </Button>
                    </Link>
                    <Link href="/#features">
                        <Button size="lg" variant="outline" className="h-11 px-8">
                            View Features
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}