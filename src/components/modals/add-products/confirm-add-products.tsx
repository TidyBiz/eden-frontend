import React, { useRef, useEffect } from 'react'
import { ProductForm } from '@/utils/constants/common'
import { useEdenMarketBackend } from '@/contexts/backend'

interface ConfirmAddProductsProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  products: ProductForm[]
  onConfirm: () => void
  isLoading?: boolean
}

export default function ConfirmAddProducts({
  isOpen,
  setIsOpen,
  products,
  onConfirm,
  isLoading = false,
}: ConfirmAddProductsProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const { branches } = useEdenMarketBackend()

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white overflow-y-auto dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="confirm-modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            🔍 Confirmar Productos a Agregar
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
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

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Revisa los siguientes productos que se agregarán al sistema:
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Se agregarán {products.length} producto
                  {products.length !== 1 ? 's' : ''} al sistema
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border rounded-md border-gray-300 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-gray-700 dark:text-gray-300 font-medium">
                    Producto
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                    PLU
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-right text-gray-700 dark:text-gray-300 font-medium">
                    Precio
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-right text-gray-700 dark:text-gray-300 font-medium">
                    Precio Alt.
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                    Pesable
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                    Stock Inicial
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                    Sucursal
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-gray-900 dark:text-white font-medium">
                      {product.name}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-center text-gray-700 dark:text-gray-300">
                      {product.PLU}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-right text-gray-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-right text-gray-700 dark:text-gray-300">
                      {product.altPrice > 0
                        ? formatCurrency(product.altPrice)
                        : '-'}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.isSoldByWeight
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {product.isSoldByWeight ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-center text-gray-900 dark:text-white font-medium">
                      {product.stockNumber} unidades
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-center text-gray-700 dark:text-gray-300">
                      {branches.find((b) => b.id === product.branchId)?.name ||
                        'No asignada'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-blue-800 dark:text-blue-200">
                Una vez confirmado, estos productos serán agregados al sistema y
                estarán disponibles para la venta.
              </span>
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
            onClick={onConfirm}
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
                Agregando...
              </div>
            ) : (
              '✅ Confirmar y Agregar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
