// ** React
import React, { useEffect, useRef, useState } from 'react'

// ** Contexts
import { useEdenMarketBackend } from '@/contexts/backend'

// ** Types
import { Branch, ProductForm } from '@/utils/constants/common'

// ** Components
import ConfirmAddProducts from './confirm-add-products'

interface AddProductsProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  branches: Branch[]
  onProductCreated?: () => void
}

////////////////////////////////////////////////////////////
function AddProducts({
  isOpen,
  setIsOpen,
  branches,
  onProductCreated,
}: AddProductsProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<ProductForm[]>([])
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProductForm>({
    PLU: 0,
    name: '',
    price: 0,
    altPrice: 0,
    isSoldByWeight: true,
    stockNumber: 0,
    branchId: '',
    description: '',
    isActive: true,
    reorderPoint: 10,
  })

  const { createProduct } = useEdenMarketBackend()

  const isSoldByWeightOptions = [
    {
      label: 'Si',
      value: 'true',
    },
    {
      label: 'No',
      value: 'false',
    },
  ]

  const branchOptions = branches.map((branch) => ({
    label: branch.name,
    value: branch.id,
  }))

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

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement

      if (firstElement) {
        firstElement.focus()
      }

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleTabKey)
      return () => document.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: Number(value) || 0 })
  }

  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleChangeBoolean = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value === 'true' ? true : false })
  }

  const handleAddProduct = async () => {
    setProducts([
      ...products,
      {
        ...formData,
      },
    ])
  }

  const handleSubmit = () => {
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    try {
      await createProduct({
        products,
      })
      setIsConfirmModalOpen(false)
      setIsOpen(false)
      if (onProductCreated) {
        onProductCreated()
      }
    } catch (error) {
      console.error('Error creating products:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
        onClick={() => setIsOpen(true)}
      >
        Añadir
      </button>
      {isOpen && (
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
            className="bg-white overflow-y-auto dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Productos
              </h2>
              <p className="text-gray-500 mb-4">
                Aquí puedes ver los productos que vas agregando.
              </p>
              <table className="w-full border-collapse border rounded-md border-gray-300 dark:border-gray-700">
                <thead>
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Nombre
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Precio
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Precio Alternativo
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2 text-xs">
                      Pesable
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2 text-xs">
                      Min. Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center border border-gray-300 dark:border-gray-700 p-2"
                      >
                        No hay productos agregados
                      </td>
                    </tr>
                  )}
                  {products.map((product) => (
                    <tr key={product.PLU}>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        {product.name}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        {product.price}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        {product.altPrice}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        {product.isSoldByWeight ? 'Si' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                Añadir Producto
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
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2 w-3/4">
                      <label
                        htmlFor="name"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700"
                        name="name"
                        value={formData.name}
                        onChange={(e) => handleChange(e)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-1/4">
                      <label
                        htmlFor="name"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        PLU
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700"
                        name="PLU"
                        value={formData.PLU}
                        onChange={(e) => handleChangeNumber(e)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2 w-/3">
                      <label
                        htmlFor="name"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Precio
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700"
                        name="price"
                        value={formData.price}
                        onChange={(e) => handleChangeNumber(e)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-1/3">
                      <label
                        htmlFor="name"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Precio Alternativo
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700"
                        name="altPrice"
                        value={formData.altPrice}
                        onChange={(e) => handleChangeNumber(e)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-1/3">
                      <label
                        htmlFor="name"
                        className="text-gray-600 dark:text-gray-400 pr-2"
                      >
                        Pesable
                      </label>
                      <select
                        id="name"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        name="isSoldByWeight"
                        value={formData.isSoldByWeight ? 'true' : 'false'}
                        onChange={(e) => handleChangeBoolean(e)}
                      >
                        {isSoldByWeightOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2 w-1/2">
                      <label
                        htmlFor="name"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Stock
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700"
                        name="stockNumber"
                        value={formData.stockNumber}
                        onChange={(e) => handleChangeNumber(e)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                      <label
                        htmlFor="name"
                        className="text-gray-600 dark:text-gray-400 pr-2"
                      >
                        Sucursal
                      </label>
                      <select
                        id="name"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        name="branchId"
                        value={formData.branchId}
                        onChange={(e) => handleChangeSelect(e)}
                      >
                        <option
                          value=""
                          className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                          Seleccionar Sucursal
                        </option>
                        {branchOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2 w-full">
                      <label
                        htmlFor="reorderPoint"
                        className="text-gray-600 dark:text-gray-400 font-bold"
                      >
                        Punto de Pedido (Stock Mínimo)
                      </label>
                      <input
                        type="text"
                        id="reorderPoint"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10 font-bold"
                        name="reorderPoint"
                        value={formData.reorderPoint}
                        onChange={(e) => handleChangeNumber(e)}
                        placeholder="Ej: 10 (kg o unidades)"
                      />
                      <p className="text-[10px] text-gray-500">
                        El sistema te avisará cuando el stock sea igual o menor a este valor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-red-500 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                onClick={handleAddProduct}
              >
                Agregar
              </button>
              <button
                disabled={products.length === 0}
                className="px-4 py-2 bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-green-700 transition-colors cursor-pointer"
                onClick={handleSubmit}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmAddProducts
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        products={products}
        onConfirm={handleConfirmSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}

export default AddProducts
