"use client"

import type { Product } from "@/utils/constants/common"
import React from "react";
import { useModalAnimation } from '@/hooks/useModalAnimation'
// ...existing code...

interface CartProduct extends Product {
  id: string
  PLU: number
  weight: number
  name: string
  price: number
  quantity: number
}

interface CashierInterfaceProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  scannedCode: string
  setScannedCode: (code: string) => void
  handleScannerInput: (e: React.KeyboardEvent<HTMLInputElement>) => void
  addProductToCart: (code: string) => void
  isProcessing: boolean
  cart: CartProduct[]
  clearCart: () => void
  updateQuantity: (id: string, newQuantity: number) => void
  removeProductFromCart: (id: string) => void
  total: number
  confirmPurchase: () => void
  showDeliveryForm: boolean
  setShowDeliveryForm: (show: boolean) => void
}

// ...existing code...
import CreateDeliveryOrderForm from "./delivery/CreateDeliveryOrderForm";

const CashierInterface: React.FC<CashierInterfaceProps> = ({
  inputRef,
  scannedCode,
  setScannedCode,
  handleScannerInput,
  addProductToCart,
  isProcessing,
  cart,
  clearCart,
  updateQuantity,
  removeProductFromCart,
  total,
  confirmPurchase,
  showDeliveryForm,
  setShowDeliveryForm,
}) => {
  const { isVisible, isClosing } = useModalAnimation(showDeliveryForm);

  return (
    <div>
      {/* Botón para crear pedido de envío */}
      <div className="flex justify-end mb-6">
        <button
          className="bg-[#598C30] hover:bg-[#4E7526] text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-200 border-2 border-[#273C1F]"
          onClick={() => setShowDeliveryForm(true)}
        >
          Crear pedido de envío
        </button>
      </div>

      {/* Modal/Formulario para crear pedido de envío */}
      {isVisible && (
          <div 
            className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4 ${isClosing ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
            onClick={(e) => {
              // Solo cerrar si el clic fue directamente en el fondo (no en el contenido del modal)
              if (e.target === e.currentTarget) {
                setShowDeliveryForm(false);
              }
            }}
          >
            <div 
              className={`bg-white rounded-xl shadow-2xl p-8 border-2 border-[#598C30] w-full max-w-[95vw] max-h-[95vh] overflow-y-auto relative ${isClosing ? 'animate-modal-content-exit' : 'animate-modal-content-enter'}`}
              onClick={(e) => e.stopPropagation()}
            >
            <button
              className="absolute top-4 right-4 text-[#598C30] hover:text-[#273C1F] text-2xl font-bold z-10"
              onClick={() => setShowDeliveryForm(false)}
            >
              ×
            </button>
            <CreateDeliveryOrderForm />
          </div>
        </div>
      )}
      {/* Scanner Input */}
      <div className="bg-[#F4F1EA] rounded-2xl shadow-xl p-6 mb-6 border-2 border-[#C1E3A4]">
        <label htmlFor="scanner" className="block text-xl font-bold text-[#273C1F] mb-4 flex items-center gap-3">
          <span className="text-3xl">🔍</span>
          Escanear Código de Producto
        </label>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            id="scanner"
            type="text"
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            onKeyDown={handleScannerInput}
            placeholder="Escanee un código o escriba manualmente..."
            className="flex-1 px-5 py-4 border-2 border-[#0aa65d] rounded-xl focus:ring-4 focus:ring-[#0aa65d]/30 focus:border-[#598C30] focus:outline-none text-lg bg-white focus:bg-[#F4F1EA] transition-all text-[#273C1F] placeholder-[#598C30] shadow-inner font-medium"
            // disabled={isProcessing}
            autoComplete="off"
            autoFocus={!showDeliveryForm}
          />
          <button
            onClick={() => addProductToCart(scannedCode.trim())}
            disabled={!scannedCode.trim() || isProcessing}
            className="px-8 py-4 bg-[#0aa65d] text-white rounded-xl hover:bg-[#598C30] disabled:bg-[#C1E3A4] disabled:text-[#598C30] disabled:cursor-not-allowed font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#0aa65d]/30 hover:scale-[1.02] active:scale-[0.98] border-2 border-[#273C1F]"
          >
            {isProcessing ? "Procesando..." : "Agregar"}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <p className="text-sm text-[#598C30] font-medium">
            💡 Códigos de ejemplo: 0000001001401, 0000002000010, 0000003000010, 0000004000010
          </p>
          <button
            onClick={() => {
              const codes = ["0000001001401", "0000002000010", "0000003000010", "0000004000010"]
              const randomCode = codes[Math.floor(Math.random() * codes.length)]
              const currentCode = scannedCode

              setScannedCode(randomCode)

              if (currentCode) {
                navigator.clipboard.writeText(currentCode)
              }
            }}
            className="text-xs text-[#598C30] hover:text-[#273C1F] bg-transparent border-2 border-[#598C30] hover:border-[#0aa65d] rounded-lg px-3 py-1.5 transition-all duration-200 font-bold"
            title="Intercambiar con un código aleatorio"
          >
            Copiar Random
          </button>
        </div>
        <p className="text-xs text-[#0aa65d] mt-2 flex items-center gap-1 font-semibold">
          <span>🎯</span>
          El campo está siempre activo para escanear códigos automáticamente
        </p>
      </div>

      {/* Shopping Cart */}
      <div className="bg-[#F4F1EA] rounded-2xl shadow-xl p-6 border-2 border-[#C1E3A4]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#273C1F] flex items-center gap-3">
            <span className="text-4xl">🛒</span>
            Carrito de Compras
          </h2>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="px-5 py-2.5 text-[#6A442C] hover:bg-[#B0855F]/20 rounded-xl border-2 border-[#B0855F] hover:border-[#6A442C] transition-all duration-300 font-bold hover:shadow-lg hover:shadow-[#B0855F]/30"
            >
              Vaciar Carrito
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16 text-[#598C30] bg-[#C1E3A4]/30 rounded-xl border-2 border-[#C1E3A4]">
            <div className="text-7xl mb-4">🛒</div>
            <p className="text-xl font-bold text-[#273C1F]">El carrito está vacío</p>
            <p className="text-sm mt-2 font-medium">Escanee un producto para comenzar</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map((item, idx) => (
                <div
                  key={item.id && item.PLU && item.name ? `${item.id}-${item.PLU}-${item.name}` : `cart-item-${idx}`}
                  className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-[#598C30] hover:border-[#0aa65d] transition-all duration-300 hover:shadow-lg hover:shadow-[#0aa65d]/20"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-[#273C1F] text-lg">
                      {item.name} - ${item.price}/kg
                    </h3>
                    {item.isSoldByWeight && (
                      <p className="text-[#598C30] mt-1 font-semibold">{Number.parseFloat(item.weight.toFixed(3))} kg</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {item.isSoldByWeight ? (
                        <p className="text-[#598C30] font-bold">{Number.parseFloat(item.weight.toFixed(3))} kg</p>
                      ) : (
                        <>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center bg-[#598C30] hover:bg-[#4E7526] rounded-lg text-white font-bold transition-all duration-200 hover:shadow-md border-2 border-[#273C1F]"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-[#273C1F] text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center bg-[#598C30] hover:bg-[#4E7526] rounded-lg text-white font-bold transition-all duration-200 hover:shadow-md border-2 border-[#273C1F]"
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>

                    <div className="text-xl font-bold text-[#273C1F] w-24 text-right">
                      ${(item.price * (item.isSoldByWeight ? item.weight : item.quantity)).toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeProductFromCart(item.id)}
                      className="ml-3 px-4 py-2 bg-[#B0855F] hover:bg-[#6A442C] text-white rounded-lg text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#B0855F]/30 border-2 border-[#6A442C]"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Actions */}
            <div className="border-t-2 border-[#598C30] pt-6">
              <div className="flex justify-between items-center mb-6 bg-[#C1E3A4]/50 rounded-xl p-5 border-2 border-[#598C30]">
                <span className="text-2xl font-bold text-[#273C1F]">Total:</span>
                <span className="text-4xl font-bold text-[#0aa65d]">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={confirmPurchase}
                className="w-full py-5 bg-[#0aa65d] hover:bg-[#598C30] text-white rounded-xl text-xl font-bold transition-all duration-300 hover:shadow-xl hover:shadow-[#0aa65d]/30 hover:scale-[1.02] active:scale-[0.98] border-2 border-[#273C1F]"
              >
                Confirmar Compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CashierInterface
