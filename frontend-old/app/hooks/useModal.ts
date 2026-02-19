import { useModalContext } from "@/app_old/contexts/ModalContext"

export const useModal = () => {
    const { openModal, closeModal } = useModalContext()
    return { openModal, closeModal }
}
