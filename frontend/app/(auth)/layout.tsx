"use client"

import ThemeToggleButton from "@/app/components/ThemeToggleButton";

export default function AuthPageLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-tertiary">
            <div className="w-full max-w-md">
                {/* Top Right Theme Button */}
                <div className="absolute top-8 right-8">
                    <ThemeToggleButton />
                </div>
                
                {/* Logo and Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover mb-6 shadow-lg shadow-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                        PackPal
                    </h1>
                    <p className="text-secondary text-sm">
                        Your AI-powered packing assistant
                    </p>
                </div>

                {children}
            </div>
        </div>
    );
}