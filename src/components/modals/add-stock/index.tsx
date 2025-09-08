// ** React
import React, { useState, useRef, useEffect } from 'react'
import { Plus, Minus, X } from 'lucide-react'

// ** Contexts
import { useEdenMarketBackend } from '@/contexts/backend'

// ** Types
import { Product } from '@/utils/constants/common'

interface AddStockModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  product: Product | null
  onStockAdded?: () => void
}

export default function AddStockModal({
  isOpen,
  setIsOpen,
  product,
  onStockAdded,
}: AddStockModalProps) {
  const [stockQuantity, setStockQuantity] = useState<string>('')
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const modalRef = useRef<HTMLDivElement>(null)

  const { branches, addStockToProduct } = useEdenMarketBackend()

  const resetModalState = () => {
    setStockQuantity('')
    setSelectedBranchId('')
    setError('')
  }

  const incrementStock = () => {
    const currentValue = parseFloat(stockQuantity) || 0
    const step = product?.isSoldByWeight ? 0.1 : 1
    const newValue = currentValue + step

    if (product?.isSoldByWeight) {
      setStockQuantity(parseFloat(newValue.toFixed(2)).toString())
    } else {
      setStockQuantity(newValue.toString())
    }
  }

  const decrementStock = () => {
    const currentValue = parseFloat(stockQuantity) || 0
    const step = product?.isSoldByWeight ? 0.1 : 1
    const newValue = Math.max(0, currentValue - step)

    if (product?.isSoldByWeight) {
      setStockQuantity(parseFloat(newValue.toFixed(2)).toString())
    } else {
      setStockQuantity(newValue.toString())
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      resetModalState()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, setIsOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!stockQuantity.trim() || !product?.id || !selectedBranchId) {
      setError('Por favor, complete todos los campos requeridos')
      return
    }

    const quantity = parseFloat(stockQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      setError('La cantidad debe ser un número positivo')
      return
    }

    if (!product?.isSoldByWeight && !Number.isInteger(quantity)) {
      setError(
        'Para este producto solo se permiten cantidades enteras (sin decimales)'
      )
      return
    }

    const finalQuantity = product?.isSoldByWeight
      ? parseFloat(quantity.toFixed(2))
      : quantity

    setIsLoading(true)

    try {
      await addStockToProduct(product.id, selectedBranchId, finalQuantity)

      setStockQuantity('')
      setSelectedBranchId('')
      setIsOpen(false)

      if (onStockAdded) {
        onStockAdded()
      }
    } catch (err) {
      console.error('Error adding stock:', err)
      setError('Error al añadir stock. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={() => {
        setIsOpen(false)
        resetModalState()
      }}
    >
      <div
        ref={modalRef}
        className="bg-white overflow-y-auto dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Añadir Stock
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => {
              setIsOpen(false)
              resetModalState()
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="productId"
                className="text-gray-600 dark:text-gray-400"
              >
                PLU del Producto
              </label>
              <input
                type="text"
                id="productId"
                value={product?.PLU || ''}
                disabled
                className="px-3 py-2 border disabled:opacity-50 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="productName"
                className="text-gray-600 dark:text-gray-400"
              >
                Producto
              </label>
              <input
                type="text"
                id="productName"
                value={product?.name || ''}
                disabled
                className="px-3 py-2 border disabled:opacity-50 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="branchSelect"
                className="text-gray-600 dark:text-gray-400"
              >
                Sucursal
              </label>
              <select
                id="branchSelect"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Seleccione una sucursal</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="stockQuantity"
                className="text-gray-600 dark:text-gray-400"
              >
                Cantidad de Stock (
                {product?.isSoldByWeight ? 'en Kg' : 'en Unidades'})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decrementStock}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Decrementar cantidad"
                >
                  <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <input
                  type="number"
                  id="stockQuantity"
                  step={product?.isSoldByWeight ? '0.01' : '1'}
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => {
                    const value = e.target.value

                    if (!product?.isSoldByWeight && value.includes('.')) {
                      return
                    }

                    if (product?.isSoldByWeight && value.includes('.')) {
                      const parts = value.split('.')
                      if (parts[1] && parts[1].length > 2) {
                        return
                      }
                    }

                    setStockQuantity(value)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder={product?.isSoldByWeight ? 'Ej: 1.5' : 'Ej: 10'}
                  required
                />
                <button
                  type="button"
                  onClick={incrementStock}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Incrementar cantidad"
                >
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                resetModalState()
              }}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                </>
              ) : (
                'Añadir Stock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
