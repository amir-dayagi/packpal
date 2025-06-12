import Modal from './Modal'

interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    message: string
    itemName?: string
}

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    message,
    itemName 
}: DeleteConfirmationModalProps) {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Delete ${itemName || 'Item'}`}
        >
            <div className="space-y-4">
                <p className="text-secondary">
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-secondary hover:cursor-pointer hover:text-secondary-hover transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:cursor-pointer hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    )
} 