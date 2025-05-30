import { useState, useEffect, useRef } from 'react'
import { Geist } from 'next/font/google'
import decode from '@/utils/decode'
import axios from 'axios'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

interface Product {
  id: string
  PLU: number
  weight: number
  name: string
  price: number
  quantity: number
}

// Simulando una base de datos de productos

export default function Home() {
  const [cart, setCart] = useState<Product[]>([])
  const [scannedCode, setScannedCode] = useState('')
  const [total, setTotal] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Calcular total cuando el carrito cambie
  useEffect(() => {
    const newTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    setTotal(newTotal)
  }, [cart])

  // Mantener el focus en el input para capturar códigos del escáner
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && !inputRef.current.disabled) {
        // Usar setTimeout para asegurar que se ejecute después de otros eventos
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 10)
      }
    }

    // Focus inicial
    focusInput()

    // Re-focus en múltiples eventos
    const events = ['click', 'blur', 'focusout', 'mousedown', 'keydown']

    events.forEach((event) => {
      document.addEventListener(event, focusInput, true)
    })

    // También escuchar cuando la ventana recupera el foco
    window.addEventListener('focus', focusInput)

    // Verificar cada cierto tiempo si el input tiene foco
    const intervalId = setInterval(() => {
      if (
        document.activeElement !== inputRef.current &&
        inputRef.current &&
        !inputRef.current.disabled
      ) {
        focusInput()
      }
    }, 100)

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, focusInput, true)
      })
      window.removeEventListener('focus', focusInput)
      clearInterval(intervalId)
    }
  }, [])

  const handleScannerInput = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && scannedCode.trim()) {
      e.preventDefault()
      addProductToCart(scannedCode.trim())

      setScannedCode('')

      // Re-enfocar inmediatamente después de procesar
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 50)
    }
  }

  const addProductToCart = async (code: string) => {
    setIsProcessing(true)

    // Simular un pequeño delay como si consultáramos una API
    // const product = productDatabase[code]
    const decodedData = decode(scannedCode.trim())

    if (decodedData) {
      const { PLU, weight } = decodedData
      const { data: product } = await axios.get(
        `http://localhost:3001/product/${PLU}`
      )
      // Aquí puedes usar los datos decodificados según tus necesidades
      if (product) {
        setCart((prevCart) => {
          console.log(prevCart)
          console.log(`Peso del producto: ${weight.toFixed(3)} kg`)
          const existingItem = prevCart.find((item) => item.PLU === PLU)

          if (existingItem) {
            return prevCart.map((item) =>
              item.PLU === PLU ? { ...item, quantity: item.quantity + 1 } : item
            )
          } else {
            return [
              ...prevCart,
              { ...product, quantity: 1, weight: weight.toFixed(3) },
            ]
          }
        })
      } else {
        alert(`Producto no encontrado: ${code}`)
      }

      setIsProcessing(false)

      // Re-enfocar después de procesar
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 50)
    } else {
      console.log('No se pudo decodificar el código:', scannedCode.trim())
    }
  }

  const removeProductFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))

    // Re-enfocar después de eliminar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProductFromCart(id)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )

    // Re-enfocar después de actualizar cantidad
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)
  }

  const confirmPurchase = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      // Re-enfocar después del alert
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
      return
    }

    const confirmation = window.confirm(
      `¿Confirmar compra por $${total.toFixed(2)}?\n\nProductos:\n${cart
        .map(
          (item) =>
            `• ${item.name} x${item.quantity} - $${(
              item.price *
              item.quantity *
              item.weight
            ).toFixed(2)}`
        )
        .join('\n')}`
    )

    if (confirmation) {
      // Aquí podrías enviar la información a tu backend
      alert('¡Compra confirmada! Gracias por su compra.')
      setCart([])
    }

    // Re-enfocar después de cualquier acción
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  const clearCart = () => {
    if (cart.length === 0) return

    const confirmation = window.confirm(
      '¿Estás seguro de que quieres vaciar el carrito?'
    )
    if (confirmation) {
      setCart([])
    }

    // Re-enfocar después de cualquier acción
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  return (
    <div className={`${geistSans.className} min-h-screen bg-gray-50 p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Eden Market</h1>
          <p className="text-gray-600">Sistema de Carrito con Escáner</p>
        </div>

        {/* Scanner Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label
            htmlFor="scanner"
            className="block text-lg font-semibold text-gray-700 mb-3"
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
              className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none text-lg bg-blue-50 focus:bg-white transition-all"
              disabled={isProcessing}
              autoComplete="off"
            />
            <button
              onClick={() => addProductToCart(scannedCode.trim())}
              disabled={!scannedCode.trim() || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isProcessing ? 'Procesando...' : 'Agregar'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            💡 Códigos de ejemplo: 1234567890, 2000100003909, 3456789012,
            4567890123
          </p>
          <p className="text-xs text-blue-600 mt-1">
            🎯 El campo está siempre activo para escanear códigos
            automáticamente
          </p>
        </div>

        {/* Shopping Cart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Carrito de Compras
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
              >
                Vaciar Carrito
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
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
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-gray-600">
                        Precio x kilo: ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-lg font-bold text-gray-800 w-20 text-right">
                        ${(item.price * item.weight * item.quantity).toFixed(2)}
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
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-bold text-gray-800">
                    Total:
                  </span>
                  <span className="text-3xl font-bold text-green-600">
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
    </div>
  )
}
