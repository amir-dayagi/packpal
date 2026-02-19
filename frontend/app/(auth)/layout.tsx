import Navbar from "@/components/common/Navbar";
import LandingPageFooter from "@/components/landing/LandingPageFooter";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar refs={[]} ref_titles={[]} />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center mb-4">
                        <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                            PackPal
                        </h1>
                    </div>
                    {children}
                </div>
            </div>
            <LandingPageFooter />
        </div>
    );
}
