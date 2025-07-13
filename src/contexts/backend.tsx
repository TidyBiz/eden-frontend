// ** React Imports
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

// ** Hooks
import axios from 'axios'

// ** Utils
import { safeLocalStorage } from '@/utils/storage'

// ** Types
import { EDEN_MARKET_BACKEND_URL } from '@/utils/constants/api'
import { User, CreateUserDto, UpdateUserDto, Product, Branch } from '@/utils/constants/common'

/*************************************************
 *                  Types                       *
 *************************************************/

export type LoginDto = {
  username: string
  password: string
}

export type LoginResponse = {
  access_token: string
  user: User
}

export type EdenMarketBackendValue = {
  user: User | null
  products: Product[]
  branches: Branch[]
  jwt: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (body: LoginDto) => Promise<LoginResponse | null>
  logout: () => void
  fetchUser: () => Promise<User>
  fetchProducts: () => Promise<Product[]>
  fetchBranches: () => Promise<Branch[]>
  createUser: (body: CreateUserDto) => Promise<User>
  createProduct: (body: CreateProductDto) => Promise<Product>
  updateUser: (body: UpdateUserDto) => Promise<User>
}

export type CreateProductDto = {
  PLU: number;
  name: string;
  price: number;
  altPrice: number;
  isSoldByWeight: boolean;
  description: string;
  branchId: string;
  stockNumber: number;
  isActive?: boolean;
}

//////////////////////////////////////////////////////////////////////////
const EdenMarketBackendContext = createContext<EdenMarketBackendValue>(
  {} as EdenMarketBackendValue
)

/**
 * Eden Market Backend context provider
 */
export function EdenMarketBackendProvider({
  children,
}: {
  children: ReactNode
}) {
  /*************************************************
   *                  States                       *
   *************************************************/
  const [user, setUser] = useState<User | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])

  /*************************************************
   *                  Effects                      *
   *************************************************/

  // Initialize auth state from localStorage only on client
  useEffect(() => {
    const authData = safeLocalStorage.getJSON<{ user: User; jwt: string }>('auth')
    if (authData) {
      setUser(authData.user)
      setJwt(authData.jwt)
    }
    setIsInitialized(true)
  }, [])

  /*************************************************
   *                  Functions                    *
   *************************************************/

  /**
   * Logs in a user with username and password
   * @param body - Login credentials
   */
  const login = async (body: LoginDto): Promise<LoginResponse | null> => {
    try {
      const res = await axios.post(
        `${EDEN_MARKET_BACKEND_URL}/auth/login`,
        body
      )

      const loginResponse: LoginResponse = res.data

      // Store JWT and user data
      setJwt(loginResponse.access_token)
      setUser(loginResponse.user)

      safeLocalStorage.setJSON('auth', {
        user: loginResponse.user,
        jwt: loginResponse.access_token
      })

      return loginResponse
    } catch (error) {
      console.log('Error logging in:', error)
      return null
    }
  }

  /**
   * Logs out the current user
   */
  const logout = () => {
    setJwt(null)
    setUser(null)
    safeLocalStorage.removeItem('auth')
  }

  /**
   * Creates a new user in the backend
   * @param body - User data to create
   */
  const createUser = async (body: CreateUserDto) => {
    try {
      const res = await axios.post(`${EDEN_MARKET_BACKEND_URL}/user`, body, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      return res.data
    } catch (error) {
      console.log('Error creating user:', error)
    }
  }

  const fetchUser = async () => {
    if (!jwt || !user?.id) return {} as User
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      console.log('fetched user: ', res.data)
      return res.data
    } catch (error) {
      console.log('Error fetching user data:', error)
      return {} as User
    }
  }

  /**
   * Updates backend user data
   */
  const updateUser = async (body: UpdateUserDto) => {
    if (!user?.id) return {} as User
    try {
      const res = await axios.put(
        `${EDEN_MARKET_BACKEND_URL}/user/${user.id}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      return res.data
    } catch (error) {
      console.log('Error updating user data:', error)
      return {} as User
    }
  }


  /**
   * Fetches products data
   */
  const fetchProducts = async () => {
    if (!jwt || !user?.id) return {} as Product[]
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/product`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      setProducts(res.data)
      return res.data
    } catch (error) {
      console.log('Error fetching products data:', error)
      return {} as Product[]
    }
  }

  /**
   * Creates a new product in the backend
   * @param body - Product data to create
   */
  const createProduct = async (body: CreateProductDto) => {
    try {
      console.log(typeof body.PLU);
      const res = await axios.post(`${EDEN_MARKET_BACKEND_URL}/product`, body, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      }
      )
      return res.data
    } catch (error) {
      console.log('Error creating product:', error)
      return {} as Product
    }
  }

  /**
   * Fetches branches data
   */
  const fetchBranches = async () => {
    if (!jwt || !user?.id) return {} as Branch[]
    try {
      const res = await axios.get(`${EDEN_MARKET_BACKEND_URL}/branch`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      setBranches(res.data)
      return res.data
    } catch (error) {
      console.log('Error fetching branches data:', error)
      return {} as Branch[]
    }
  }

  /**
   * Generates a livepeer JWT based on the body.
   * @param body - Data to check and generate JWT if valid.
   * @returns {Promise<object | undefined>} The generated JWT or undefined.
   */

  const value: EdenMarketBackendValue = {
    user,
    products,
    branches,
    jwt,
    isAuthenticated: !!jwt && !!user,
    isInitialized,
    login,
    logout,
    fetchUser,
    fetchProducts,
    fetchBranches,
    createUser,
    createProduct,
    updateUser,
  }

  return (
    <EdenMarketBackendContext.Provider value={value}>
      {children}
    </EdenMarketBackendContext.Provider>
  )
}

export function useEdenMarketBackend() {
  return useContext(EdenMarketBackendContext)
}
