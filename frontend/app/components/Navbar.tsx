'use client'

import { useAuth } from "../contexts/auth"
import Link from "next/link"

export default function Navbar() {
    const { logout } = useAuth()

    return (
        <nav className="border-b border-tertiary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        PackPal
                    </Link>
                    <button 
                        onClick={logout}
                        className="text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
} 