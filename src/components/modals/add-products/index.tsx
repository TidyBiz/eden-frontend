// ** React
import React, { useEffect, useRef, useState } from 'react'
import { useModalAnimation } from '@/hooks/useModalAnimation'

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
  const { isVisible, isClosing } = useModalAnimation(isOpen)

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
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, setIsOpen])

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

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
      {isVisible && (
        <div
          ref={overlayRef}
          className={`fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-md ${isClosing ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={modalRef}
            className={`bg-white overflow-y-auto rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] mx-4 border-2 border-[#598C30] ${isClosing ? 'animate-modal-content-exit' : 'animate-modal-content-enter'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col justify-between items-center p-6 border-b border-[#598C30]">
              <h2 className="text-xl font-semibold text-[#273C1F]">
                Productos
              </h2>
              <p className="text-[#273C1F] mb-4">
                Aquí puedes ver los productos que vas agregando.
              </p>
              <table className="w-full border-collapse rounded-md border-2 border-[#598C30]">
                <thead>
                  <tr>
                    <th className="border-2 border-[#598C30] p-2 bg-[#F4F1EA] text-[#273C1F]">
                      Nombre
                    </th>
                    <th className="border-2 border-[#598C30] p-2 bg-[#F4F1EA] text-[#273C1F]">
                      Precio
                    </th>
                    <th className="border-2 border-[#598C30] p-2 bg-[#F4F1EA] text-[#273C1F]">
                      Precio Alternativo
                    </th>
                    <th className="border-2 border-[#598C30] p-2 bg-[#F4F1EA] text-[#273C1F] text-xs">
                      Pesable
                    </th>
                    <th className="border-2 border-[#598C30] p-2 bg-[#F4F1EA] text-[#273C1F] text-xs">
                      Min. Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center border-2 border-[#598C30] p-2 text-[#273C1F]"
                      >
                        No hay productos agregados
                      </td>
                    </tr>
                  )}
                  {products.map((product) => (
                    <tr key={product.PLU}>
                      <td className="border-2 border-[#598C30] p-2 text-[#273C1F]">
                        {product.name}
                      </td>
                      <td className="border-2 border-[#598C30] p-2 text-[#273C1F]">
                        {product.price}
                      </td>
                      <td className="border-2 border-[#598C30] p-2 text-[#273C1F]">
                        {product.altPrice}
                      </td>
                      <td className="border-2 border-[#598C30] p-2 text-[#273C1F]">
                        {product.isSoldByWeight ? 'Si' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center p-6 border-b border-[#598C30]">
              <h2
                id="modal-title"
                className="text-xl font-semibold text-[#273C1F]"
              >
                Añadir Producto
              </h2>
              <button
                className="text-[#598C30] hover:text-[#273C1F] transition-colors p-2 rounded-md hover:bg-[#F4F1EA]"
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
                        className="text-sm font-semibold text-[#598C30]"
                      >
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 rounded-xl border-2 border-[#598C30] focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                        name="name"
                        value={formData.name}
                        onChange={(e) => handleChange(e)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-1/4">
                      <label
                        htmlFor="name"
                        className="text-sm font-semibold text-[#598C30]"
                      >
                        PLU
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 rounded-xl border-2 border-[#598C30] focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                        name="PLU"
                        value={formData.PLU}
                        onChange={(e) => handleChangeNumber(e)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2 w-1/3">
                      <label
                        htmlFor="name"
                        className="text-sm font-semibold text-[#598C30]"
                      >
                        Precio
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 rounded-xl border-2 border-[#598C30] focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                        name="price"
                        value={formData.price}
                        onChange={(e) => handleChangeNumber(e)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-1/3">
                      <label
                        htmlFor="name"
                        className="text-sm font-semibold text-[#598C30]"
                      >
                        Precio Alternativo
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 rounded-xl border-2 border-[#598C30] focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                        name="altPrice"
                        value={formData.altPrice}
                        onChange={(e) => handleChangeNumber(e)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-1/3">
                      <label
                        htmlFor="name"
                        className="text-sm font-semibold text-[#598C30] pr-2"
                      >
                        Pesable
                      </label>
                      <select
                        id="name"
                        className="w-full px-4 py-2 rounded-xl border-2 border-[#598C30] focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                        name="isSoldByWeight"
                        value={formData.isSoldByWeight ? 'true' : 'false'}
                        onChange={(e) => handleChangeBoolean(e)}
                      >
                        {isSoldByWeightOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#F4F1EA] text-[#273C1F]"
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
                        className="text-sm font-semibold text-[#598C30]"
                      >
                        Stock
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 rounded-xl border-2 border-[#598C30] focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                        name="stockNumber"
                        value={formData.stockNumber}
                        onChange={(e) => handleChangeNumber(e)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                      <label
                        htmlFor="name"
                        className="text-sm font-semibold text-[#598C30] pr-2"
                      >
                        Sucursal
                      </label>
                      <select
                        id="name"
                        className="w-full px-4 py-2 rounded-xl border-2 border-[#598C30] focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
                        name="branchId"
                        value={formData.branchId}
                        onChange={(e) => handleChangeSelect(e)}
                      >
                        <option
                          value=""
                          className="bg-[#F4F1EA] text-[#273C1F]"
                        >
                          Seleccionar Sucursal
                        </option>
                        {branchOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#F4F1EA] text-[#273C1F]"
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
                        className="text-sm font-bold text-[#598C30]"
                      >
                        Punto de Pedido (Stock Mínimo)
                      </label>
                      <input
                        type="text"
                        id="reorderPoint"
                        className="w-full px-4 py-2 rounded-xl border-2 border-[#598C30] focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-yellow-50 font-bold"
                        name="reorderPoint"
                        value={formData.reorderPoint}
                        onChange={(e) => handleChangeNumber(e)}
                        placeholder="Ej: 10 (kg o unidades)"
                      />
                      <p className="text-[10px] text-[#273C1F]">
                        El sistema te avisará cuando el stock sea igual o menor a este valor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-[#598C30] bg-[#F4F1EA]">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-200 border-2 border-gray-300 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer font-semibold"
                onClick={handleAddProduct}
              >
                Agregar
              </button>
              <button
                disabled={products.length === 0}
                className="px-4 py-2 bg-[#0aa65d] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-[#598C30] transition-colors cursor-pointer font-bold"
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
