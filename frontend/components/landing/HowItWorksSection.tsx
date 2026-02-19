export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="container mx-auto py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                    How it Works
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12 pt-8">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">1</div>
                        <h3 className="text-xl font-bold">Chat & Plan</h3>
                        <p className="text-muted-foreground">Tell PackPal about your trip. It generates a smart initial list for you.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">2</div>
                        <h3 className="text-xl font-bold">Pack & Track</h3>
                        <p className="text-muted-foreground">As you pack, mark items as "packed". See exactly what you're taking.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">3</div>
                        <h3 className="text-xl font-bold">Travel & Return</h3>
                        <p className="text-muted-foreground">Add purchased items during your trip and use the "Returning" checklist to pack for home.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
