import type { Dispatch, SetStateAction } from 'react'
import decode from '@/utils/lib/decode'
import type {
  Product,
  User,
  CreateTransactionDto,
  Transaction,
} from '@/utils/constants/common'
import toast from 'react-hot-toast'

export interface CartProduct extends Product {
  quantity: number
  weight: number
}

interface CreateCartHandlersParams {
  setIsProcessing: (value: boolean) => void
  fetchProductByBarcode: (PLU: number) => Promise<Product | null>
  setCart: Dispatch<SetStateAction<CartProduct[]>>
  focusScanner: () => void
  cart: CartProduct[]
  total: number
  user: User | null
  createTransaction: (body: CreateTransactionDto) => Promise<Transaction | null>
  setShowConfirmModal: (show: boolean) => void
  setShowClearCartModal: (show: boolean) => void
}

export function createCartHandlers({
  setIsProcessing,
  fetchProductByBarcode,
  setCart,
  focusScanner,
  cart,
  setShowConfirmModal,
  setShowClearCartModal,
}: CreateCartHandlersParams) {
  const addProductToCart = async (code: string) => {
    setIsProcessing(true)

    const { decodedData, error } = decode(code)

    if (error) {
      toast.error(error)
      setIsProcessing(false)
      setTimeout(() => {
        focusScanner()
      }, 50)
    }

    if (decodedData) {
      const { PLU, weight } = decodedData || {}
      const product = await fetchProductByBarcode(PLU)

      if (product) {
        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.PLU === PLU)

          if (existingItem) {
            const itemWeight =
              Math.round((existingItem.weight + weight) * 1000) / 1000

            if (itemWeight > 99) {
              alert(
                `⚠️ Error: El peso total del item "${product.name}" sería ${itemWeight}kg.\nEl límite máximo por item es 99kg (límite de balanza).\n\nPeso actual: ${existingItem.weight}kg\nPeso a agregar: ${weight}kg`
              )
              setIsProcessing(false)
              setTimeout(() => {
                focusScanner()
              }, 50)
              return prevCart
            }

            return prevCart.map((item) =>
              item.PLU === PLU
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    weight: Math.round((item.weight + weight) * 1000) / 1000,
                  }
                : item
            )
          } else {
            return [...prevCart, { ...product, quantity: 1, weight }]
          }
        })
      } else {
        alert(`Producto no encontrado: ${code}`)
      }

      setIsProcessing(false)

      setTimeout(() => {
        focusScanner()
      }, 50)
    } else {
      console.log('No se pudo decodificar el código:', code.trim())
    }
  }

  const removeProductFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))

    setTimeout(() => {
      focusScanner()
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

    setTimeout(() => {
      focusScanner()
    }, 50)
  }

  const confirmPurchase = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      setTimeout(() => {
        focusScanner()
      }, 100)
      return
    }

    setShowConfirmModal(true)
  }

  const clearCart = () => {
    if (cart.length === 0) return

    setShowClearCartModal(true)
  }

  const handleClearCartConfirm = () => {
    setCart([])
    setTimeout(() => {
      focusScanner()
    }, 100)
  }

  const handleTransactionSuccess = () => {
    setCart([])
    toast.success('¡Compra confirmada! Gracias por su compra.')
    setTimeout(() => {
      focusScanner()
    }, 100)
  }

  const handleTransactionError = (error: string) => {
    toast.error(error)
    setTimeout(() => {
      focusScanner()
    }, 100)
  }

  return {
    addProductToCart,
    removeProductFromCart,
    updateQuantity,
    confirmPurchase,
    clearCart,
    handleClearCartConfirm,
    handleTransactionSuccess,
    handleTransactionError,
  }
}
