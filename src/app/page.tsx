"use client"
// ** React & Next
import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Geist } from "next/font/google"

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
import ExtractionModal from "@/components/modals/extractions";
import Louver from "@/components/louver";
import  WelcomeScreen  from '@/components/welcome'

// ** Utils & Types
import { createCartHandlers } from "@/utils/lib/cart"
import type { Product, User } from "@/utils/constants/common"
import toast from 'react-hot-toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
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
  const [showExtractionsModal, setShowExtractionsModal] = useState(false)

  // Cash Register States
  const [showOpenRegisterModal, setShowOpenRegisterModal] = useState(false);
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);
  const [closeRegisterStats, setCloseRegisterStats] = useState<any>(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);
  const [isExtractionLoading, setIsExtractionLoading] = useState(false);

  // Louver States
  const [showLouver, setShowLouver] = useState(true);
  const [isLouverAnimating, setIsLouverAnimating] = useState(false);

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
    getSessionStats,
    createExtraction
  } = useEdenMarketBackend()


  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        setShowLouver(false);
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);


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

  
  const focusScanner = useCallback(() => {
    if (showLoginModal || showConfirmModal || showClearCartModal || showDebtorsModal || showUsersModal || showOpenRegisterModal || showCloseRegisterModal || showExtractionsModal) return;
    if (inputRef.current && !inputRef.current.disabled) {
      setTimeout(() => {
        if (inputRef.current && !showLoginModal && !showConfirmModal && !showClearCartModal) {
          inputRef.current.focus();
        }
      }, 10);
    }
  }, [showLoginModal, showConfirmModal, showClearCartModal, showDebtorsModal, showUsersModal, showOpenRegisterModal, showCloseRegisterModal, showExtractionsModal]);

  useEffect(() => {
    const newTotal = cart.reduce(
      (sum, item) => sum + item.price * (item.isSoldByWeight ? item.weight : item.quantity),
      0,
    )
    setTotal(newTotal)
  }, [cart])

  useEffect(() => {
    if (showLoginModal || showConfirmModal || showClearCartModal || showDeliveryForm || showDebtorsModal || showUsersModal || showOpenRegisterModal || showCloseRegisterModal || showExtractionsModal) return;
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
  }, [focusScanner, showLoginModal, showConfirmModal, showClearCartModal, showDeliveryForm, showDebtorsModal, showUsersModal, showOpenRegisterModal, showCloseRegisterModal, showExtractionsModal]);

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
      
      setShowLouver(true);
      setIsLouverAnimating(true);
      
      await new Promise(resolve => setTimeout(resolve, 1050));
      
      logout();
      
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-2 border-green-500`}
        >
          <div className="flex-1 w-0 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-4xl">✅</div>
              <div className="ml-4 flex-1">
                <p className="text-xl font-bold text-[#273C1F] mb-2">
                  Caja Cerrada Correctamente
                </p>
                <p className="text-base text-gray-600">
                  La sesión de caja ha sido cerrada exitosamente.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setShowLouver(false);
      setIsLouverAnimating(false);
    } catch (error) {
      console.error("Error closing register:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
     
      setShowLouver(false);
      setIsLouverAnimating(false);

      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-2 border-red-500`}
        >
          <div className="flex-1 w-0 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-4xl">❌</div>
              <div className="ml-4 flex-1">
                <p className="text-xl font-bold text-[#273C1F] mb-2">
                  Error al Cerrar la Caja
                </p>
                <p className="text-base text-gray-600">
                  {errorMessage}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Por favor, intente nuevamente.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      ), {
        duration: 6000,
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setIsLoginLoading(true)
    setLoginError("")
    setShowLouver(true)
    setIsLouverAnimating(true)
    
    await new Promise(resolve => setTimeout(resolve, 1050))
    
    try {
      const response = await login({ username, password })
      if (response) {
        setShowLoginModal(false)
        setShowUserMenu(false)
        await new Promise(resolve => setTimeout(resolve, 300))
        setShowLouver(false)
      } else {
        setLoginError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setShowLouver(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      setLoginError("Error al iniciar sesión. Por favor, inténtalo de nuevo.")
      setShowLouver(false)
    } finally {
      setIsLoginLoading(false)
      setIsLouverAnimating(false)
    }
  }

  const handleLogout = async () => {
    setShowLouver(true)
    setIsLouverAnimating(true)
    
    await new Promise(resolve => setTimeout(resolve, 1050))
    
    logout()
    setShowUserMenu(false)
    setCart([])
    
    await new Promise(resolve => setTimeout(resolve, 300))
    setShowLouver(false)
    setIsLouverAnimating(false)
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

  const openExtractionsModal = () => {
    setShowExtractionsModal(true)
    setShowUserMenu(false)
  }

  const handleExtraction = async (amount: number, comment: string) => {
    if (!user || !user.branchId) {
      toast.error("Error: El usuario no tiene una sucursal asignada. Contacte al administrador.");
      return;
    }

    setIsExtractionLoading(true);
    try {
      const result = await createExtraction({
        amount,
        comment,
        cashierId: String(user.id),
        branchId: user.branchId,
      });

      if (result) {
        toast.success(`Extracción registrada correctamente\nCantidad: $${amount.toFixed(2)}\nMotivo: ${comment}`);
        setShowExtractionsModal(false);
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error) {
      console.error("Error al registrar extracción:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al registrar la extracción: ${errorMessage}`);
    } finally {
      setIsExtractionLoading(false);
    }
  };

 
  if (!isInitialized) {
    return (
      <>
        <Louver isVisible={true} showLoading={true} />
      </>
    )
  }

  return (
    <div 
      className={`${geistSans.className} min-h-screen p-4 relative`}
      style={{
        backgroundColor: "#F4F1EA",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/bg.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "153px",
          backgroundColor: "#ede0c2",
          opacity: 0.12,
        }}
      />
      <div className="relative z-10">
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
          onExtractions={openExtractionsModal}
        />

        {!isAuthenticated ? (
          <WelcomeScreen isLoginLoading={isLoginLoading} loginError={loginError} handleSubmit={handleLogin} />
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
            isOpen={showLoginModal}
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

        <ExtractionModal
          isOpen={showExtractionsModal}
          onClose={() => setShowExtractionsModal(false)}
          onSubmit={handleExtraction}
          isLoading={isExtractionLoading}
        />

        <Louver 
          isVisible={showLouver} 
          showLoading={isLouverAnimating || isLoginLoading}
        />
      </div>
      </div>
    </div>
  )
}
