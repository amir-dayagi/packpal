'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface ModalContextType {
    openModal: <P extends ModalProps>(component: React.ComponentType<P>, props?: Omit<P, keyof ModalProps>) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalContent, setModalContent] = useState<ReactNode | null>(null)

    const onOpenChange = (open: boolean) => {
        if (!open) {
            setModalContent(null)
        }
    }

    const openModal = <P extends ModalProps>(Component: React.ComponentType<P>, props: Omit<P, keyof ModalProps> = {} as any) => {
        setModalContent(
            <Component
                {...props as P}
                open={true}
                onOpenChange={onOpenChange}
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

export function useModal() {
    const context = useContext(ModalContext)
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}
