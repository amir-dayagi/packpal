import { IconBrandGithub, IconLuggage } from "@tabler/icons-react";
import Link from "next/link";

export default function LandingPageFooter() {
    return (
        <footer className="border-t w-full py-6 md:py-0">
            <div className="container min-w-full px-10 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <IconLuggage className="h-6 w-6" />
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Amir Dayagi
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="https://github.com/amir-dayagi/packpal" className="text-muted-foreground hover:text-foreground">
                        <IconBrandGithub className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </footer>
    )
}
