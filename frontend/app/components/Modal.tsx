'use client'

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-200"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative z-50 bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border border-tertiary/50 max-w-md w-full p-6 transform transition-all duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-secondary hover:text-foreground hover:bg-tertiary/50 transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
} 