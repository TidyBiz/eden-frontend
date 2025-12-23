"use client"
// ** React & Next
import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Geist } from "next/font/google"
import { Chewy } from "next/font/google"

// ** Contexts
import { useEdenMarketBackend } from "@/contexts/backend"

// ** Components
import Navbar from "@/components/navbar"
import AdminInterface from "@/components/admin"
import LoginModal from "@/components/modals/login"
import CashierInterface from "@/components/cashier"
import ConfirmPurchaseModal from "@/components/modals/create-transaction"
import ClearCartModal from "@/components/modals/create-transaction/clear-cart"
import DebtorsModal from "@/components/modals/debtors"

// ** Utils & Types
import { createCartHandlers } from "@/utils/lib/cart"
import type { Product, User } from "@/utils/constants/common"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const chewy = Chewy({
  weight: "400",
  variable: "--font-chewy",
  subsets: ["latin"],
})

interface CartProduct extends Product {
  quantity: number
  weight: number
}

// User type is imported from "@/utils/constants/common"

import CourierIndex from "@/components/courier";

export default function HomePage() {
  const [cart, setCart] = useState<CartProduct[]>([])
  const [scannedCode, setScannedCode] = useState("")
  const [total, setTotal] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showClearCartModal, setShowClearCartModal] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [showDebtorsModal, setShowDebtorsModal] = useState(false)

  const { user, isAuthenticated, isInitialized, login, logout, fetchProductByBarcode, createTransaction } =
    useEdenMarketBackend()

  // Scanner focus logic
  // Evitar focus automático si hay un modal de pedido abierto
  const focusScanner = useCallback(() => {
    if (showLoginModal || showConfirmModal || showClearCartModal || showDebtorsModal) return;
    if (inputRef.current && !inputRef.current.disabled) {
      setTimeout(() => {
        if (inputRef.current && !showLoginModal && !showConfirmModal && !showClearCartModal) {
          inputRef.current.focus();
        }
      }, 10);
    }
  }, [showLoginModal, showConfirmModal, showClearCartModal, showDebtorsModal]);

  useEffect(() => {
    const newTotal = cart.reduce(
      (sum, item) => sum + item.price * (item.isSoldByWeight ? item.weight : item.quantity),
      0,
    )
    setTotal(newTotal)
  }, [cart])

  useEffect(() => {
    // Si hay algún modal abierto, o el formulario de pedido está abierto, no registrar eventos ni intervalos de focus
    if (showLoginModal || showConfirmModal || showClearCartModal || showDeliveryForm || showDebtorsModal) return;
    focusScanner();
    const events = ["click", "blur", "focusout", "mousedown", "keydown"];
    events.forEach((event) => {
      document.addEventListener(event, focusScanner, true);
    });
    window.addEventListener("focus", focusScanner);
    const intervalId = setInterval(() => {
      if (
        document.activeElement !== inputRef.current &&
        inputRef.current &&
        !inputRef.current.disabled &&
        !showLoginModal &&
        !showConfirmModal &&
        !showClearCartModal &&
        !showDeliveryForm
      ) {
        focusScanner();
      }
    }, 100);
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, focusScanner, true);
      });
      window.removeEventListener("focus", focusScanner);
      clearInterval(intervalId);
    };
  }, [focusScanner, showLoginModal, showConfirmModal, showClearCartModal, showDeliveryForm, showDebtorsModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".user-menu-container")) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu])

  const {
    addProductToCart,
    removeProductFromCart,
    updateQuantity,
    confirmPurchase,
    clearCart,
    handleClearCartConfirm,
    handleTransactionSuccess,
    handleTransactionError,
  } = createCartHandlers({
    setIsProcessing,
    fetchProductByBarcode,
    setCart,
    focusScanner,
    cart,
    total,
    user,
    createTransaction,
    setShowConfirmModal,
    setShowClearCartModal,
  })

  const handleScannerInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && scannedCode.trim()) {
      e.preventDefault()
      addProductToCart(scannedCode.trim())
      setScannedCode("")
      setTimeout(() => {
        focusScanner()
      }, 50)
    }
  }

  // Login logic
  const handleLogin = async (username: string, password: string) => {
    setIsLoginLoading(true)
    setLoginError("")
    try {
      const response = await login({ username, password })
      if (response) {
        setShowLoginModal(false)
        setShowUserMenu(false)
      } else {
        setLoginError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setLoginError("Error al iniciar sesión. Por favor, inténtalo de nuevo.")
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
    setLoginError("")
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
    setLoginError("")
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  const openDebtorsModal = () => {
    setShowDebtorsModal(true)
    setShowUserMenu(false)
  }

  const WelcomeScreen = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (username.trim() && password.trim()) {
        await handleLogin(username.trim(), password.trim())
      }
    }

    return (
      <div className="fixed inset-0 flex">
        {/* Left side - Brand imagery with leaf pattern */}
        <div
          className="hidden md:flex md:w-1/2 bg-[#273C1F] relative overflow-hidden"
          style={{
            backgroundImage: "url('/bg-2.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "153px",
          }}
        >
          {/* Tagline positioned at bottom left */}
          <div className="absolute bottom-18 bg-[#273C1F] left-1/2 -translate-x-1/2 z-10 text-center rounded-xl">
            <h2
              className="text-6xl font-bold text-[#a2d45e] tracking-wide whitespace-nowrap"
              style={{ fontFamily: "var(--font-chewy)" }}
            >
              Del campo a tu mesa
            </h2>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 bg-[#F4F1EA] flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Logo and brand */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <img src="/logo.svg" alt="Edén" className="h-24 w-auto" />
              </div>
              <p className="text-sm tracking-[0.3em] text-gray-600 uppercase font-light">Verdulerías</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#598C30]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#598C30] focus:border-transparent text-gray-700 placeholder-gray-400 transition-all"
                  placeholder="Usuario"
                  disabled={isLoginLoading}
                  required
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#598C30]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#598C30] focus:border-transparent text-gray-700 placeholder-gray-400 transition-all"
                  placeholder="Contraseña"
                  disabled={isLoginLoading}
                  required
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {loginError}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoginLoading || !username.trim() || !password.trim()}
                className="w-full py-4 bg-[#273C1F] hover:bg-[#a2d45e] disabled:bg-[#C1E3A4] disabled:cursor-not-allowed text-[#273C1F] rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] text-white"
              >
                {isLoginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.07-.24C7.89 17.2 10.26 12.31 17 8z" fill="#598C30" />
                <path
                  d="M3.82 21.34C5.9 16.17 8 10 17 8c-1.45-1.75-3.2-3-5-3-3.31 0-6 2.69-6 6 0 2.97 2.16 5.43 5 5.91v2.03c-3.87-.48-7-3.85-7-7.94 0-4.42 3.58-8 8-8 2.53 0 4.77 1.17 6.24 3h.76l-1.06-1.06C16.38 2.56 14.27 2 12 2 6.48 2 2 6.48 2 12c0 4.84 3.46 8.87 8 9.8v-2.03c-3.87-.48-7-3.85-7-7.94 0-.62.08-1.21.21-1.79z"
                  fill="#4E7526"
                />
              </svg>
              <p className="text-sm text-gray-600">© Edén Verdulerías</p>
            </div>
          </div>
        </div>
      </div>
    )
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

  return (
    <div className={`${geistSans.className} ${chewy.className} min-h-screen bg-[#F4F1EA] p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Navbar
          isLoggedIn={isAuthenticated}
          user={user as User | null}
          handleLogin={openLoginModal}
          handleLogout={handleLogout}
          toggleUserMenu={toggleUserMenu}
          showUserMenu={showUserMenu}
          openDebtorsModal={openDebtorsModal}
        />

        {/* Contenido condicional basado en el estado del usuario */}
        {!isAuthenticated ? (
          <WelcomeScreen />
        ) : String((user as User | null)?.role) === "admin" ? (
          <AdminInterface />
        ) : String((user as User | null)?.role) === "courier" ? (
          <CourierIndex />
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
            showDeliveryForm={showDeliveryForm}
            setShowDeliveryForm={setShowDeliveryForm}
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

        {/* Modal de Confirmación de Compra */}
        {showConfirmModal && (
          <ConfirmPurchaseModal
            isOpen={showConfirmModal}
            setIsOpen={setShowConfirmModal}
            cart={cart}
            total={total}
            user={user}
            createTransaction={createTransaction}
            onSuccess={handleTransactionSuccess}
            onError={handleTransactionError}
          />
        )}

        {/* Modal de Vaciar Carrito */}
        {showClearCartModal && (
          <ClearCartModal
            isOpen={showClearCartModal}
            setIsOpen={setShowClearCartModal}
            onConfirm={handleClearCartConfirm}
          />
        )}

        {/* Modal de Deudores */}
        <DebtorsModal isOpen={showDebtorsModal} onClose={() => setShowDebtorsModal(false)} />
      </div>
    </div>
  )
}
