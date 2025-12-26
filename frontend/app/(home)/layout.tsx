"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/app/components/home/Navbar"

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({})
    
    return (
        <QueryClientProvider client={queryClient}>
            <Navbar />
            <main>
                {children}
            </main>
        </QueryClientProvider>
    )
}