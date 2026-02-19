"use client"

import Navbar from "@/components/common/Navbar"
import LandingPageFooter from "@/components/landing/LandingPageFooter"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import CallForActionSection from "@/components/landing/CallForActionSection"
import DemoVideoSection from "@/components/landing/DemoVideoSection"
import { useAuth } from "@/contexts/AuthContext"

export default function LandingPage() {
    const { session } = useAuth()

    const refs = ["/#demo", "/#features", "/#how-it-works"]
    const ref_titles = ["Demo", "Features", "How it Works"]
    const isLoggedIn = !!session
    if (isLoggedIn) {
        refs.unshift("/dashboard")
        ref_titles.unshift("Dashboard")
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar refs={refs} ref_titles={ref_titles} login={!isLoggedIn} signup={!isLoggedIn} avatar={isLoggedIn} />

            <div className="flex-1">
                <HeroSection />
                <DemoVideoSection />
                <FeaturesSection />
                <HowItWorksSection />
                <CallForActionSection />
            </div>

            <LandingPageFooter />
        </div>
    )
}
