"use client"

import Link from "next/link";
import { useAuth } from "./contexts/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/app/components/GradientButton";
import ThemeToggleButton from "@/app/components/ThemeToggleButton";

function HeroSection() {
    return (
        <div className="relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <div className="text-center">
                    {/* Logo */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover mb-8 shadow-lg shadow-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
                        PackPal
                    </h1>
                    <p className="text-xl md:text-2xl text-secondary mb-4 max-w-2xl mx-auto">
                        Your AI-powered packing assistant
                    </p>
                    <p className="text-lg text-secondary/80 mb-12 max-w-xl mx-auto">
                        Never forget an essential item again. Let AI help you pack smarter for every trip.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <GradientButton
                            as="link"
                            size="lg"
                            href="/signup"
                        >
                            Get Started
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </GradientButton>
                        
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center rounded-xl border-2 border-primary px-8 py-4 text-base font-semibold text-primary hover:bg-primary/10 transition-all duration-200"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureSection() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Why PackPal?
                </h2>
                <p className="text-lg text-secondary max-w-2xl mx-auto">
                    Everything you need to pack with confidence
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard
                    title="AI-Powered Suggestions"
                    description="Get intelligent packing recommendations based on your destination, weather, and trip duration."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>}
                />
                <FeatureCard
                    title="Never Forget Anything"
                    description="Keep track of all your items with our comprehensive checklist system. Mark items as packed and stay organized."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>}
                />
                <FeatureCard
                    title="Trip Management"
                    description="Organize multiple trips, save packing lists, and reuse them for future adventures."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0a2.25 2.25 0 00-1.5 2.122v6a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-1.5-2.122M6 6.878V4.5c0-1.036.84-1.875 1.875-1.875h8.25c1.036 0 1.875.84 1.875 1.875V6.878" />
                    </svg>}
                />
            </div>
        </div>
    );
}

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
    return (
        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-tertiary/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-hover/20 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
                {title}
            </h3>
            <p className="text-secondary">
                {description}
            </p>
        </div>
    )
}

function CTASection() {
    return (
        <div className="bg-gradient-to-r from-primary/10 to-primary-hover/10 border-t border-tertiary/50 py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Ready to pack smarter?
                </h2>
                <p className="text-lg text-secondary mb-8">
                    Join PackPal today and make packing stress-free
                </p>
                <GradientButton
                    as="link"
                    size="lg"
                    href="/signup"
                >
                    Get Started Free
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </GradientButton>
            </div>
        </div>
    );
}

function Footer() {
    return (
        <footer className="border-t border-tertiary/50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-secondary text-sm mb-4 md:mb-0">
                        © 2024 PackPal. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <Link href="/login" className="text-sm text-secondary hover:text-primary transition-colors">
                            Sign In
                        </Link>
                        <Link href="/signup" className="text-sm text-secondary hover:text-primary transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function LandingPage() {
    const { session } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect authenticated users to trips page
        if (session) {
            router.replace("/trips");
        }
    }, [session, router]);

    // Don't render landing page if user is authenticated (will redirect)
    if (session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-tertiary">
            <nav className="sticky top-0 z-40 border-b border-tertiary/50 bg-background/80 backdrop-blur-md shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">PackPal</span>

                    <ThemeToggleButton />
                </div>
            </nav>
            
            <HeroSection />

            <FeatureSection />

            <CTASection />
            
            <Footer />
        </div>
    );
}

