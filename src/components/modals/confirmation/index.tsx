//** React
import React, { useRef, useEffect } from 'react'
import { useModalAnimation } from '@/hooks/useModalAnimation'

//** Types
interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: React.ReactNode
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
    type?: 'danger' | 'warning' | 'info'
}

////////////////////////////////////////////////////////////
export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false,
    type = 'info',
}: ConfirmationModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    const handleOverlayClick = (event: React.MouseEvent) => {
        if (event.target === overlayRef.current) {
            onClose()
        }
    }

    const { isVisible, isClosing } = useModalAnimation(isOpen)

    if (!isVisible) return null

    const getConfirmButtonColor = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700'
            case 'warning':
                return 'bg-orange-600 hover:bg-orange-700'
            case 'info':
            default:
                return 'bg-blue-600 hover:bg-blue-700'
        }
    }

    return (
        <div
            ref={overlayRef}
            className={`fixed inset-0 bg-black/60 flex justify-center items-center z-[60] backdrop-blur-md ${isClosing ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
        >
            <div
                ref={modalRef}
                className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-800 ${isClosing ? 'animate-modal-content-exit' : 'animate-modal-content-enter'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {title}
                    </h3>
                    <div className="text-gray-600 dark:text-gray-300 mb-6">
                        {message}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-white rounded-md transition-colors ${getConfirmButtonColor()}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Procesando...</span>
                                </div>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
