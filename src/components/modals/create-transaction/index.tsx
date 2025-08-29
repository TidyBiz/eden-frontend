import React, { useRef, useEffect, useState } from 'react'
import { CartProduct } from '@/utils/lib/cart'
import {
  User,
  CreateTransactionDto,
  Transaction,
} from '@/utils/constants/common'

interface ConfirmPurchaseModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  cart: CartProduct[]
  total: number
  user: User | null
  createTransaction: (body: CreateTransactionDto) => Promise<Transaction | null>
  onSuccess: () => void
  onError: (error: string) => void
}

export default function ConfirmPurchaseModal({
  isOpen,
  setIsOpen,
  cart,
  total,
  user,
  createTransaction,
  onSuccess,
  onError,
}: ConfirmPurchaseModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
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
  }, [isOpen, setIsOpen])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      setIsOpen(false)
    }
  }

  const handleConfirmPurchase = async () => {
    if (!user) {
      return
    }

    setIsLoading(true)
    try {
      const res = await createTransaction({
        branchId: user.branchId,
        cashierId: user.id,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.isSoldByWeight ? item.weight : item.quantity,
        })),
      })

      if (res && typeof res === 'object' && 'id' in res) {
        onSuccess()
        setIsOpen(false)
      } else if (typeof res === 'string') {
        onError(res)
        setIsOpen(false)
      } else {
        onError('Error al confirmar la compra')
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      onError(
        error instanceof Error ? error.message : 'Error al confirmar la compra'
      )
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Confirmar Compra
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isLoading}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              ¿Confirmar compra por{' '}
              <span className="font-bold text-green-600 dark:text-green-400">
                ${total.toFixed(2)}
              </span>
              ?
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Productos:
              </h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.name}
                      {item.isSoldByWeight ? (
                        <span className="text-gray-500 dark:text-gray-400">
                          {' '}
                          x{parseFloat(item.weight.toFixed(3))} kg
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          {' '}
                          x{item.quantity}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      $
                      {(
                        item.price *
                        (item.isSoldByWeight ? item.weight : item.quantity)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirmPurchase}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </div>
            ) : (
              'Aceptar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
