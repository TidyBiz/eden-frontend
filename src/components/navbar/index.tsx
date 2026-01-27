"use client"

// ** Types
import type { User } from "@/utils/constants/common"

////////////////////////////////////////////////////////////
export default function Navbar({
  isLoggedIn,
  user,
  handleLogin,
  handleLogout,
  toggleUserMenu,
  showUserMenu,
  openDebtorsModal,
  openUsersModal,
  onCloseRegister,
  onExtractions,
}: {
  isLoggedIn: boolean
  user: User | null
  handleLogin: () => void
  handleLogout: () => void
  toggleUserMenu: () => void
  showUserMenu: boolean
  openDebtorsModal: () => void
  openUsersModal: () => void
  onCloseRegister: () => void
  onExtractions: () => void
}) {
  return (
    <div className="bg-gradient-to-r from-[#598C30] to-[#4E7526] rounded-2xl shadow-xl p-6 mb-6 border-2 border-[#273C1F]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F4F1EA] mb-2 tracking-tight">Eden Market</h1>
          <p className="text-[#C1E3A4] font-medium">Sistema de Carrito con Escáner</p>
        </div>
        <div className="relative user-menu-container">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-[#F4F1EA] font-semibold">
                {isLoggedIn ? user?.username || "Usuario" : "Invitado"}
              </p>
              <p className="text-xs text-[#C1E3A4]">{isLoggedIn ? user?.role || "user" : "No autenticado"}</p>
            </div>
            <button
              onClick={toggleUserMenu}
              className="w-10 h-10 bg-[#0aa65d] hover:bg-[#0aa65d]/80 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#F4F1EA]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#273C1F] rounded-xl shadow-2xl border-2 border-[#598C30] z-50">
              <div className="py-2">
                {isLoggedIn ? (
                  <>
                    {/* Fiados (Solo Cashier) */}
                    {user?.role === 'cashier' && (
                      <>
                        <button
                          onClick={openDebtorsModal}
                          className="w-full px-4 py-2 text-left text-[#F4F1EA] hover:bg-[#598C30] transition-all duration-200 flex items-center gap-2 font-medium rounded-lg mx-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Fiados
                        </button>
                        <button
                          onClick={onExtractions}
                          className="w-full px-4 py-2 text-left text-[#F4F1EA] hover:bg-[#598C30] transition-all duration-200 flex items-center gap-2 font-medium rounded-lg mx-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {/* Billete de dólar con símbolo $ */}
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 18h18M4 6v12h16V6H4z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-2-4h4" />
                            {/* Flecha de extracción hacia la derecha */}
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12l-4-4m4 4l-4 4m4-4H15" />
                          </svg>
                          Extracciones
                        </button>
                        <button
                          onClick={onCloseRegister}
                          className="w-full px-4 py-2 text-left text-[#F4F1EA] hover:bg-[#598C30] transition-all duration-200 flex items-center gap-2 font-medium rounded-lg mx-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Cierre de Caja
                        </button>
                      </>
                    )}

                    {/* Usuarios (Solo Admin) */}
                    {user?.role === 'admin' && ( // "Ademas necesito que en ese mismo menu para el usuario admin haya una opcion que sea usuarios"
                      <button
                        onClick={openUsersModal}
                        className="w-full px-4 py-2 text-left text-[#F4F1EA] hover:bg-[#598C30] transition-all duration-200 flex items-center gap-2 font-medium rounded-lg mx-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Usuarios
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-[#F4F1EA] hover:bg-[#598C30] transition-all duration-200 flex items-center gap-2 font-medium rounded-lg mx-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLogin}
                      className="w-full px-4 py-2 text-left text-[#F4F1EA] hover:bg-[#598C30] transition-all duration-200 flex items-center gap-2 font-medium rounded-lg mx-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      Iniciar Sesión
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
