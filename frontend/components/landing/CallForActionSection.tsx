import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CallForActionSection() {
    return (
        <section className="container mx-auto py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-3xl bg-secondary/30 p-8 md:p-12 w-full">
                    <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl font-bold mb-4">
                        Ready to revolutionize your packing?
                    </h2>
                    <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7 mb-6">
                        Join thousands of travelers who pack smarter with PackPal.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="h-11 px-8 text-lg">
                            Get Started Now
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}