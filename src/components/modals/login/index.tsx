// ** React
import { useState } from 'react'

////////////////////////////////////////////////////////////
export default function LoginModal({
  handleLogin,
  closeLoginModal,
  loginError,
  isLoginLoading,
}: {
  handleLogin: (username: string, password: string) => void
  closeLoginModal: () => void
  loginError: string
  isLoginLoading: boolean
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    if (username.trim() && password.trim()) {
      await handleLogin(username.trim(), password.trim())
      if (!loginError) {
        setUsername('')
        setPassword('')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Iniciar Sesión</h2>
          <button
            onClick={closeLoginModal}
            className="text-gray-400 hover:text-gray-200"
            disabled={isLoginLoading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loginError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {loginError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              placeholder="Escribe tu usuario..."
              disabled={isLoginLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              placeholder="Escribe tu contraseña..."
              disabled={isLoginLoading}
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoginLoading || !username.trim() || !password.trim()}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
          >
            {isLoginLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
