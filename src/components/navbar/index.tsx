import React from 'react'

export default function Navbar({
  isLoggedIn,
  handleLogin,
  handleLogout,
  toggleUserMenu,
  showUserMenu,
}: {
  isLoggedIn: boolean
  handleLogin: () => void
  handleLogout: () => void
  toggleUserMenu: () => void
  showUserMenu: boolean
}) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Eden Market</h1>
          <p className="text-gray-300">Sistema de Carrito con Escáner</p>
        </div>
        <div className="relative user-menu-container">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-300">
                {isLoggedIn ? 'Usuario' : 'Invitado'}
              </p>
              <p className="text-xs text-gray-400">
                {isLoggedIn ? 'Admin' : 'No autenticado'}
              </p>
            </div>
            <button
              onClick={toggleUserMenu}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-50">
              <div className="py-2">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
