import { IconLuggage } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/common/ModeToggle";
import { AvatarDropdown } from "@/components/common/AvatarDropdown";

interface NavbarProps {
    refs: string[]
    ref_titles: string[]
    login?: boolean
    signup?: boolean
    avatar?: boolean
}

export default function Navbar({ refs, ref_titles, login, signup, avatar }: NavbarProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50">
            <div className="container min-w-full h-full flex items-center px-4">
                <div className="mr-4 hidden md:flex">
                    <Link className="mr-6 flex items-center space-x-2 text-primary" href="/">
                        <IconLuggage className="h-6 w-6" />
                        <span className="hidden font-bold sm:inline-block">PackPal</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {refs.map((ref, index) => (
                            <Link key={index} href={ref} className="transition-colors hover:text-foreground/80 text-foreground/60">
                                {ref_titles[index]}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <ModeToggle />
                    </div>
                    <nav className="flex items-center">
                        {login && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Log in</Link>
                            </Button>
                        )}
                        {signup && (
                            <Button size="sm" asChild>
                                <Link href="/signup">Get Started</Link>
                            </Button>
                        )}
                        {avatar && (
                            <AvatarDropdown />
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}