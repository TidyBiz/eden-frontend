// ** React & Next
import { useState, useEffect, useRef, useCallback } from 'react'
import { Geist } from 'next/font/google'

// ** Contexts
import { useEdenMarketBackend } from '@/contexts/backend'

// ** Components
import Navbar from '@/components/navbar'
import AdminInterface from '@/components/admin'
import LoginModal from '@/components/modals/login'
import CashierInterface from '@/components/cashier'

// ** Utils & Types
import { createCartHandlers } from '@/utils/lib/cart'
import type { Product } from '@/utils/constants/common'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

interface CartProduct extends Product {
  quantity: number
  weight: number
}

////////////////////////////////////////////////////////////
export default function Home() {
  const [cart, setCart] = useState<CartProduct[]>([])
  const [scannedCode, setScannedCode] = useState('')
  const [total, setTotal] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    user,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    fetchProductByBarcode,
    createTransaction,
  } = useEdenMarketBackend()

  /*************************************************
   *                  Scanner                      *
   *************************************************/

  // Función centralizada para manejar el foco del input del scanner
  const focusScanner = useCallback(() => {
    // No aplicar foco si el modal de login está abierto
    if (showLoginModal) return

    if (inputRef.current && !inputRef.current.disabled) {
      setTimeout(() => {
        // Verificar nuevamente el estado del modal antes de aplicar foco
        if (inputRef.current && !showLoginModal) {
          inputRef.current.focus()
        }
      }, 10)
    }
  }, [showLoginModal])

  // Calcular total cuando el carrito cambie
  useEffect(() => {
    const newTotal = cart.reduce(
      (sum, item) =>
        sum + item.price * (item.isSoldByWeight ? item.weight : item.quantity),
      0
    )
    setTotal(newTotal)
  }, [cart])

  // Mantener el focus en el input para capturar códigos del escáner
  useEffect(() => {
    // Focus inicial
    focusScanner()

    // Re-focus en múltiples eventos
    const events = ['click', 'blur', 'focusout', 'mousedown', 'keydown']

    events.forEach((event) => {
      document.addEventListener(event, focusScanner, true)
    })

    // También escuchar cuando la ventana recupera el foco
    window.addEventListener('focus', focusScanner)

    // Verificar cada cierto tiempo si el input tiene foco
    const intervalId = setInterval(() => {
      if (
        document.activeElement !== inputRef.current &&
        inputRef.current &&
        !inputRef.current.disabled &&
        !showLoginModal
      ) {
        focusScanner()
      }
    }, 100)

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, focusScanner, true)
      })
      window.removeEventListener('focus', focusScanner)
      clearInterval(intervalId)
    }
  }, [focusScanner, showLoginModal])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const {
    addProductToCart,
    removeProductFromCart,
    updateQuantity,
    confirmPurchase,
    clearCart,
  } = createCartHandlers({
    setIsProcessing,
    fetchProductByBarcode,
    setCart,
    focusScanner,
    cart,
    total,
    user,
    createTransaction,
  })

  const handleScannerInput = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && scannedCode.trim()) {
      e.preventDefault()
      addProductToCart(scannedCode.trim())

      setScannedCode('')

      // Re-enfocar inmediatamente después de procesar
      setTimeout(() => {
        focusScanner()
      }, 50)
    }
  }

  /*************************************************
   *                  Login                        *
   *************************************************/

  const handleLogin = async (username: string, password: string) => {
    setIsLoginLoading(true)
    setLoginError('')

    try {
      const response = await login({
        username,
        password,
      })

      if (response) {
        setShowLoginModal(false)
        setShowUserMenu(false)
      } else {
        setLoginError('Credenciales inválidas. Por favor, inténtalo de nuevo.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoginError('Error al iniciar sesión. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    setCart([])
  }

  const openLoginModal = () => {
    setShowLoginModal(true)
    setShowUserMenu(false)
    setLoginError('')
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
    setLoginError('')
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  if (!isInitialized) {
    return (
      <div className={`${geistSans.className} min-h-screen bg-gray-900 p-4`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-300">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  const WelcomeScreen = () => (
    <div className="text-center py-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-8xl mb-8">🏪</div>
        <h1 className="text-4xl font-bold text-gray-100 mb-6">
          Bienvenido al Sistema de Gestión de Eden Market
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Para continuar y acceder a las funcionalidades del sistema, por favor
          inicie sesión con sus credenciales.
        </p>
        <button
          onClick={openLoginModal}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className={`${geistSans.className} min-h-screen bg-gray-900 p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Navbar
          isLoggedIn={isAuthenticated}
          user={user}
          handleLogin={openLoginModal}
          handleLogout={handleLogout}
          toggleUserMenu={toggleUserMenu}
          showUserMenu={showUserMenu}
        />

        {/* Contenido condicional basado en el estado del usuario */}
        {!isAuthenticated ? (
          <WelcomeScreen />
        ) : user?.role === 'admin' ? (
          <AdminInterface />
        ) : (
          <CashierInterface
            inputRef={inputRef}
            scannedCode={scannedCode}
            setScannedCode={setScannedCode}
            handleScannerInput={handleScannerInput}
            addProductToCart={addProductToCart}
            isProcessing={isProcessing}
            cart={cart}
            clearCart={clearCart}
            updateQuantity={updateQuantity}
            removeProductFromCart={removeProductFromCart}
            total={total}
            confirmPurchase={confirmPurchase}
          />
        )}

        {/* Modal de Login */}
        {showLoginModal && (
          <LoginModal
            handleLogin={handleLogin}
            closeLoginModal={closeLoginModal}
            loginError={loginError}
            isLoginLoading={isLoginLoading}
          />
        )}
      </div>
    </div>
  )
}
