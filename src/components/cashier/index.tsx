import { Product } from '@/utils/constants/common'
import React from 'react'

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
}

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
}) => (
  <div>
    {/* Scanner Input */}
    <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <label
        htmlFor="scanner"
        className="block text-lg font-semibold text-gray-200 mb-3"
      >
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
          className="flex-1 px-4 py-3 border-2 border-blue-500 rounded-lg focus:ring-4 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-lg bg-gray-700 focus:bg-gray-600 transition-all text-gray-100 placeholder-gray-400"
          disabled={isProcessing}
          autoComplete="off"
        />
        <button
          onClick={() => addProductToCart(scannedCode.trim())}
          disabled={!scannedCode.trim() || isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed font-medium"
        >
          {isProcessing ? 'Procesando...' : 'Agregar'}
        </button>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        💡 Códigos de ejemplo: 1234567890, 2000100003909, 3456789012, 4567890123
      </p>
      <p className="text-xs text-blue-400 mt-1">
        🎯 El campo está siempre activo para escanear códigos automáticamente
      </p>
    </div>

    {/* Shopping Cart */}
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Carrito de Compras</h2>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="px-4 py-2 text-red-400 hover:bg-red-900 rounded-lg border border-red-600 hover:border-red-500 transition-colors"
          >
            Vaciar Carrito
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-lg">El carrito está vacío</p>
          <p className="text-sm">Escanee un producto para comenzar</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-100">
                    {item.name} - ${item.price}/kg
                  </h3>
                  {item.isSoldByWeight && (
                    <p className="text-gray-300">
                      {parseFloat(item.weight.toFixed(3))} kg
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {item.isSoldByWeight ? (
                      <p className="text-gray-300">
                        {parseFloat(item.weight.toFixed(3))} kg
                      </p>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-500 rounded text-gray-200 font-bold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-500 rounded text-gray-200 font-bold"
                        >
                          +
                        </button>
                      </>
                    )}
                  </div>

                  <div className="text-lg font-bold text-gray-100 w-20 text-right">
                    $
                    {(
                      item.price *
                      (item.isSoldByWeight ? item.weight : item.quantity)
                    ).toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeProductFromCart(item.id)}
                    className="ml-3 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total and Actions */}
          <div className="border-t border-gray-600 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-bold text-gray-100">Total:</span>
              <span className="text-3xl font-bold text-green-400">
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={confirmPurchase}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xl font-semibold transition-colors"
            >
              Confirmar Compra
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)

export default CashierInterface
