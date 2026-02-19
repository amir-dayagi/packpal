import GradientButton from "./GradientButton";
import Modal from "./Modal";

type FormModalProps = {
    onClose: () => void;
    title: string;
    submitText: string;
    isLoading?: boolean;
    children: React.ReactNode;
    handleSubmit: (e: React.FormEvent) => void;
}

export default function FormModal({ onClose, handleSubmit, title, children, submitText: submitButtonText, isLoading }: FormModalProps) {
    return (
        <Modal
            onClose={onClose}
            title={title}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {children}

                {/* Cancel and Confirmation Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-tertiary/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary hover:text-foreground hover:bg-tertiary/50 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <GradientButton
                        type="submit"
                        loading={isLoading}
                    >
                        {submitButtonText}
                    </GradientButton>
                </div>
            </form>
        </Modal>
    );
}