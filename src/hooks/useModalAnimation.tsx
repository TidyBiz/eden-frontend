//** React
import { useState, useEffect } from 'react'

////////////////////////////////////////////////////////////
export function useModalAnimation(isOpen: boolean, onClose?: () => void) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setIsVisible(true)
    } else if (isVisible && !isOpen) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isVisible])

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return {
    isVisible,
    isClosing,
    handleClose,
  }
}
