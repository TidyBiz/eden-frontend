// ** React
import { useState, type FormEventHandler } from 'react'


// ** Types
interface WelcomeScreenProps {
  isLoginLoading: boolean
  loginError: string
  handleSubmit: (username: string, password: string) => void
}

////////////////////////////////////////////////////////////////////////////
export default function WelcomeScreen({ isLoginLoading, loginError, handleSubmit }: WelcomeScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const onFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    handleSubmit(username, password)
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
        <div className="absolute bottom-18 left-1/2 -translate-x-1/2 z-10 text-center">
          <h2
            className="text-6xl font-bold text-[#a2d45e] tracking-wide whitespace-nowrap"
            style={{ 
              fontFamily: "var(--font-chewy)",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)"
            }}
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

          <form onSubmit={onFormSubmit} className="space-y-5">
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
              className="w-full py-4 bg-[#273C1F] hover:bg-[#a2d45e] disabled:bg-[#C1E3A4] disabled:cursor-not-allowed disabled:text-[#273C1F] text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
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
