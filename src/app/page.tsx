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
import UsersModal from "@/components/modals/users"
import CourierIndex from "@/components/courier";
import OpenRegisterModal from "@/components/modals/open-register";
import CloseRegisterModal from "@/components/modals/close-register";

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
  const [showUsersModal, setShowUsersModal] = useState(false)

  // Cash Register States
  const [showOpenRegisterModal, setShowOpenRegisterModal] = useState(false);
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);
  const [closeRegisterStats, setCloseRegisterStats] = useState<any>(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  const {
    user,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    fetchProductByBarcode,
    createTransaction,
    checkActiveSession,
    openSession,
    closeSession,
    getSessionStats
  } = useEdenMarketBackend()

  // Check active session when user is authenticated and is a cashier
  useEffect(() => {
    const checkSession = async () => {
      if (isAuthenticated && user?.role === 'cashier' && !checkingSession) {
        setCheckingSession(true);
        const { hasActiveSession } = await checkActiveSession(String(user.id));
        if (!hasActiveSession) {
          setShowOpenRegisterModal(true);
        }
        setCheckingSession(false);
      }
    };

    if (isAuthenticated && user?.role === 'cashier') {
      checkSession();
    }
  }, [isAuthenticated, user]);

  // Scanner focus logic
  const focusScanner = useCallback(() => {
    if (showLoginModal || showConfirmModal || showClearCartModal || showDebtorsModal || showUsersModal || showOpenRegisterModal || showCloseRegisterModal) return;
    if (inputRef.current && !inputRef.current.disabled) {
      setTimeout(() => {
        if (inputRef.current && !showLoginModal && !showConfirmModal && !showClearCartModal) {
          inputRef.current.focus();
        }
      }, 10);
    }
  }, [showLoginModal, showConfirmModal, showClearCartModal, showDebtorsModal, showUsersModal, showOpenRegisterModal, showCloseRegisterModal]);

  useEffect(() => {
    const newTotal = cart.reduce(
      (sum, item) => sum + item.price * (item.isSoldByWeight ? item.weight : item.quantity),
      0,
    )
    setTotal(newTotal)
  }, [cart])

  useEffect(() => {
    if (showLoginModal || showConfirmModal || showClearCartModal || showDeliveryForm || showDebtorsModal || showUsersModal || showOpenRegisterModal || showCloseRegisterModal) return;
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
  }, [focusScanner, showLoginModal, showConfirmModal, showClearCartModal, showDeliveryForm, showDebtorsModal, showUsersModal, showOpenRegisterModal, showCloseRegisterModal]);

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

  // Cash Register Handlers
  const handleOpenRegister = async (initialCash: number) => {
    if (!user) return;

    if (!user.branchId) {
      alert("Error: El usuario no tiene una sucursal asignada. Contacte al administrador.");
      return;
    }

    setIsRegisterLoading(true);
    try {
      await openSession(String(user.id), user.branchId, initialCash);
      setShowOpenRegisterModal(false);
    } catch (error) {
      console.error("Error opening register:", error);
      alert("Error al abrir la caja. Intente nuevamente.");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleOpenCloseRegisterModal = async () => {
    if (!user) return;
    setIsRegisterLoading(true);
    try {
      const stats = await getSessionStats(String(user.id));
      setCloseRegisterStats(stats?.totals || null);
      setShowCloseRegisterModal(true);
      setShowUserMenu(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleConfirmCloseRegister = async (finalCash: number) => {
    if (!user) return;
    setIsRegisterLoading(true);
    try {
      await closeSession(String(user.id), finalCash);
      setShowCloseRegisterModal(false);
      logout();
      alert("Caja cerrada separada correctamente.");
    } catch (error) {
      console.error("Error closing register:", error);
      alert("Error al cerrar la caja. Intente nuevamente.");
    } finally {
      setIsRegisterLoading(false);
    }
  };

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

  const openUsersModal = () => {
    setShowUsersModal(true)
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
        {/* Left side */}
        <div
          className="hidden md:flex md:w-1/2 bg-[#273C1F] relative overflow-hidden"
          style={{
            backgroundImage: "url('/bg-2.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "153px",
          }}
        >
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
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <img src="/logo.svg" alt="Edén" className="h-24 w-auto" />
              </div>
              <p className="text-sm tracking-[0.3em] text-gray-600 uppercase font-light">Verdulerías</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-4 pr-4 py-4 bg-white border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#598C30] focus:border-transparent text-gray-700 placeholder-gray-400 transition-all text-center"
                  placeholder="Usuario"
                  disabled={isLoginLoading}
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-4 py-4 bg-white border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#598C30] focus:border-transparent text-gray-700 placeholder-gray-400 transition-all text-center"
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

              <button
                type="submit"
                disabled={isLoginLoading || !username.trim() || !password.trim()}
                className="w-full py-4 bg-[#273C1F] hover:bg-[#a2d45e] disabled:bg-[#C1E3A4] disabled:cursor-not-allowed text-[#273C1F] rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] text-white"
              >
                {isLoginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 pt-4">
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
        <Navbar
          isLoggedIn={isAuthenticated}
          user={user as User | null}
          handleLogin={openLoginModal}
          handleLogout={handleLogout}
          toggleUserMenu={toggleUserMenu}
          showUserMenu={showUserMenu}
          openDebtorsModal={openDebtorsModal}
          openUsersModal={openUsersModal}
          onCloseRegister={handleOpenCloseRegisterModal}
        />

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

        {showLoginModal && (
          <LoginModal
            handleLogin={handleLogin}
            closeLoginModal={closeLoginModal}
            loginError={loginError}
            isLoginLoading={isLoginLoading}
          />
        )}

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

        {showClearCartModal && (
          <ClearCartModal
            isOpen={showClearCartModal}
            setIsOpen={setShowClearCartModal}
            onConfirm={handleClearCartConfirm}
          />
        )}

        <DebtorsModal isOpen={showDebtorsModal} onClose={() => setShowDebtorsModal(false)} />
        <UsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />

        <OpenRegisterModal
          isOpen={showOpenRegisterModal}
          onOpenRegister={handleOpenRegister}
          isLoading={isRegisterLoading}
          userBranch={user?.branch?.name || ''}
        />

        <CloseRegisterModal
          isOpen={showCloseRegisterModal}
          onClose={() => setShowCloseRegisterModal(false)}
          onConfirmClose={handleConfirmCloseRegister}
          stats={closeRegisterStats}
          isLoading={isRegisterLoading}
        />
      </div>
    </div>
  )
}
