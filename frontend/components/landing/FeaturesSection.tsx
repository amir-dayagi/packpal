import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconMessageChatbot, IconCheckbox, IconShoppingBag, IconRefresh } from "@tabler/icons-react"

export default function FeaturesSection() {
    return (
        <section id="features" className="w-full bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
            <div className="container mx-auto space-y-6">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                        More Than Just a Checklist
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        PackPal helps you manage your entire packing lifecycle, from planning to returning home.
                    </p>
                </div>
                <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <IconMessageChatbot className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>AI Assistant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Chat with PackPal to generate your initial list or make smart edits instantly.
                            </CardDescription>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <IconCheckbox className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Plan vs. Actual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Mark what you actually packed versus what you planned. Learn for next time.
                            </CardDescription>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <IconShoppingBag className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Track Purchases</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Bought souvenirs? Add them to your list mid-trip so you don't forget them.
                            </CardDescription>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <IconRefresh className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Returning Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Ensure everything you brought (and bought) makes it back home safely.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}