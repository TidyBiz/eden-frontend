export const safeLocalStorage = {
    getItem: (key: string): string | null => {
      if (typeof window !== 'undefined') {
        try {
          return localStorage.getItem(key)
        } catch (error) {
          console.error('Error reading from localStorage:', error)
          return null
        }
      }
      return null
    },
    
    setItem: (key: string, value: string): void => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.error('Error writing to localStorage:', error)
        }
      }
    },
    
    removeItem: (key: string): void => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.error('Error removing from localStorage:', error)
        }
      }
    },
  
    clear: (): void => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear()
        } catch (error) {
          console.error('Error clearing localStorage:', error)
        }
      }
    },
  
    // Helper for JSON objects
    getJSON: <T>(key: string): T | null => {
      const item = safeLocalStorage.getItem(key)
      if (item) {
        try {
          return JSON.parse(item) as T
        } catch (error) {
          console.error('Error parsing JSON from localStorage:', error)
          return null
        }
      }
      return null
    },
  
    setJSON: <T>(key: string, value: T): void => {
      try {
        const jsonString = JSON.stringify(value)
        safeLocalStorage.setItem(key, jsonString)
      } catch (error) {
        console.error('Error stringifying JSON for localStorage:', error)
      }
    }
  }