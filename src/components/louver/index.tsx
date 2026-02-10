"use client"

//** React
import React from "react"
import { Chewy } from "next/font/google"

//** Fonts
const chewy = Chewy({
  weight: "400",
  variable: "--font-chewy",
  subsets: ["latin"],
})

//** Types
interface LouverProps {
  isVisible: boolean
  onAnimationComplete?: () => void
  showLoading?: boolean
}

////////////////////////////////////////////////////////////////////////////
export default function Louver({ isVisible, onAnimationComplete, showLoading = true }: LouverProps) {

  const handleTransitionEnd = () => {
    if (!isVisible && onAnimationComplete) {
      onAnimationComplete()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-transform duration-1000 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${chewy.variable}`}
      onTransitionEnd={handleTransitionEnd}
      style={{
        backgroundImage: "url('/bg-2.svg')",
        backgroundRepeat: "repeat",
        backgroundSize: "153px",
        backgroundColor: "#273C1F",
      }}
    >
      <div className="h-full w-full flex flex-col items-center justify-center relative">
        {/* Slogan */}
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

        {/* Loading Spinner */}
        {showLoading && (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-[#a2d45e] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[#a2d45e] text-xl font-medium">Cargando...</p>
          </div>
        )}
      </div>
    </div>
  )
}
