import { useTheme } from "@/app/hooks/useTheme";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  
    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-tertiary/60 bg-tertiary/40 text-secondary hover:bg-tertiary-hover/70 hover:text-foreground transition-colors duration-200"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
            // Sun icon
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75V5.25M18.364 5.636L17.303 6.697M20.25 12H18.75M18.364 18.364L17.303 17.303M12 18.75V20.25M6.697 17.303L5.636 18.364M5.25 12H3.75M6.697 6.697L5.636 5.636M12 8.25A3.75 3.75 0 1 0 12 15.75A3.75 3.75 0 0 0 12 8.25Z" />
            </svg>
            ) : (
            // Moon icon
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
            </svg>
            )}
        </button>
    );
}