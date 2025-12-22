'use client'

import { useAuth } from "../contexts/auth"
import Link from "next/link"

export default function Navbar() {
    const { logout } = useAuth()

    return (
        <nav className="sticky top-0 z-40 border-b border-tertiary/50 bg-background/80 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link 
                        href="/trips" 
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                            PackPal
                        </span>
                    </Link>
                    <button 
                        onClick={logout}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-secondary hover:text-foreground hover:bg-tertiary/50 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    )
} 