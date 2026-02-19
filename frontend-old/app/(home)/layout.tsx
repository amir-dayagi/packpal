"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/app_old/components/home/Navbar"
import { ModalProvider } from "@/app_old/contexts/ModalContext"

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({})

    return (
        <QueryClientProvider client={queryClient}>
            <ModalProvider>
                <Navbar />
                <main>
                    {children}
                </main>
            </ModalProvider>
        </QueryClientProvider>
    )
}