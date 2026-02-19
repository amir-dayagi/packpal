"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/components/common/Navbar";
import { ModalProvider } from "@/contexts/ModalContext";

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const queryClient = new QueryClient({})

    return (
        <QueryClientProvider client={queryClient}>
            <ModalProvider>
                <div className="h-screen flex flex-col overflow-hidden">
                    <Navbar refs={["/dashboard", "/archived"]} ref_titles={["Dashboard", "Archived"]} avatar />
                    <main className="flex-1 container min-h-full min-w-full px-8 pt-24 pb-8 flex flex-col overflow-y-auto">
                        {children}
                    </main>
                </div>
            </ModalProvider>
        </QueryClientProvider>
    );
}
