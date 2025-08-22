import type { Dispatch, SetStateAction } from 'react'
import decode from './decode'
import type {
  Product,
  User,
  CreateTransactionDto,
  Transaction,
} from './constants/common'

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
  createTransaction: (
    body: CreateTransactionDto
  ) => Promise<Transaction | null>
}

export function createCartHandlers({
  setIsProcessing,
  fetchProductByBarcode,
  setCart,
  focusScanner,
  cart,
  total,
  user,
  createTransaction,
}: CreateCartHandlersParams) {
  const addProductToCart = async (code: string) => {
    setIsProcessing(true)
    const decodedData = decode(code.trim())

    if (decodedData) {
      const { PLU, weight } = decodedData
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

  const confirmPurchase = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      setTimeout(() => {
        focusScanner()
      }, 100)
      return
    }

    const confirmation = window.confirm(
      `¿Confirmar compra por $${total}?\n\nProductos:\n${cart
        .map(
          (item) =>
            `• ${item.name} x${item.quantity} - $${(
              item.price * (item.isSoldByWeight ? item.weight : item.quantity)
            ).toFixed(2)}`
        )
        .join('\n')}`
    )

    if (confirmation && user) {
      alert('¡Compra confirmada! Gracias por su compra.')
      createTransaction({
        branchId: user.branchId,
        cashierId: user.id,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.isSoldByWeight ? item.weight : item.quantity,
        })),
      })
      // setCart([])
    }

    setTimeout(() => {
      focusScanner()
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
  }
}