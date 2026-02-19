
import { IconPlayerPlay } from "@tabler/icons-react"

export default function DemoVideoSection() {
    return (
        <section id="demo" className="container mx-auto py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold mb-6">
                    See PackPal in Action
                </h2>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted shadow-2xl">
                    <video src="/packpal_demo.mov" controls className="h-full w-full object-contain" />
                </div>
            </div>
        </section>
    )
}
