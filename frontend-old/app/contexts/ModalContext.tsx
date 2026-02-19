'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ModalProps {
    onClose: () => void;
}

interface ModalContextType {
    openModal: <P extends ModalProps>(component: React.ComponentType<P>, props?: Omit<P, keyof ModalProps>) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalContent, setModalContent] = useState<ReactNode | null>(null)

    const openModal = <P extends ModalProps>(Component: React.ComponentType<P>, props: Omit<P, keyof ModalProps> = {} as any) => {
        setModalContent(
            <Component
                {...props as P}
                onClose={closeModal}
            />
        )
    }

    const closeModal = () => {
        setModalContent(null)
    }

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            {modalContent}
        </ModalContext.Provider>
    )
}

export function useModalContext() {
    const context = useContext(ModalContext)
    if (context === undefined) {
        throw new Error('useModalContext must be used within a ModalProvider')
    }
    return context
}
