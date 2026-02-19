type AuthErrorMessageProps = {
    errorMessage: string;
}

export default function AuthErrorMessage({errorMessage}: AuthErrorMessageProps) {
    return (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm font-medium text-red-800">
                    {errorMessage}
                </p>
            </div>
        </div>
    )
}