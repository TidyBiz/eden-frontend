// ** React
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

// ** Hooks
import axios from 'axios'

// ** Utils
import { safeLocalStorage } from '@/utils/storage'

// ** Types
import { EDEN_MARKET_BACKEND_URL } from '@/utils/constants/api'
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  Product,
  Branch,
  CreateTransactionDto,
  Transaction,
} from '@/utils/constants/common'

/*************************************************
 *                  Types                        *
 *************************************************/

export type LoginDto = {
  username: string
  password: string
}

export type LoginResponse = {
  access_token: string
  user: User
}

export type CreateProductDto = {
  PLU: number
  name: string
  price: number
  altPrice: number
  isSoldByWeight: boolean
  description: string
  branchId: string
  stockNumber: number
  isActive?: boolean
}

/*************************************************
 *              Analytics Types                  *
 *************************************************/

export type RevenuePerBranch = {
  branchId: string
  branchName: string
  totalRevenue: number
}

export type LowStockAlert = {
  id: string
  product: Product
  currentStock: number
  threshold: number
}

export type BranchAnalytics = {
  revenuePerBranch: RevenuePerBranch[]
  activeBranchesCount: number
  totalRevenue: number
  totalTransactions: number
}

export type StockAnalytics = {
  lowStockAlerts: LowStockAlert[]
  lowStockCount: number
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
  fetchUser: () => Promise<User | null>
  fetchProducts: () => Promise<Product[]>
  fetchProductByBarcode: (PLU: number) => Promise<Product | null>
  fetchBranches: () => Promise<Branch[]>
  createUser: (body: CreateUserDto) => Promise<User | undefined>
  createProduct: (body: CreateProductDto) => Promise<Product | null>
  updateUser: (body: UpdateUserDto) => Promise<User | null>
  fetchTransactions: () => Promise<Transaction[]>
  createTransaction: (body: CreateTransactionDto) => Promise<Transaction | null>
  fetchRevenuePerBranch: () => Promise<RevenuePerBranch[]>
  fetchActiveBranchesCount: () => Promise<number>
  fetchTotalRevenue: () => Promise<number>
  fetchTotalTransactions: () => Promise<number>
  fetchLowStockAlerts: (threshold?: number) => Promise<LowStockAlert[]>
  fetchLowStockCount: (threshold?: number) => Promise<number>
  fetchBranchAnalytics: () => Promise<BranchAnalytics>
  fetchStockAnalytics: (threshold?: number) => Promise<StockAnalytics>
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
    const authData = safeLocalStorage.getJSON<{ user: User; jwt: string }>(
      'auth'
    )
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
        jwt: loginResponse.access_token,
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
    if (!jwt || !user?.id) return null
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
      return null
    }
  }

  /**
   * Updates backend user data
   */
  const updateUser = async (body: UpdateUserDto) => {
    if (!user?.id) return null
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
      return null
    }
  }

  /**
   * Fetches products data
   */
  const fetchProducts = async () => {
    if (!jwt || !user?.id) return []
    try {
      const res = await axios.get(`${EDEN_MARKET_BACKEND_URL}/product`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      setProducts(res.data)
      return res.data
    } catch (error) {
      console.log('Error fetching products data:', error)
      return []
    }
  }

  /**
   * Fetches products data
   */
  const fetchProductByBarcode = async (PLU: number) => {
    if (!jwt || !user?.id) return []
    try {
      const res = await axios.get(`${EDEN_MARKET_BACKEND_URL}/product/${PLU}`, { 
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      setProducts(res.data)
      return res.data
    } catch (error) {
      console.log('Error fetching products data:', error)
      return []
    }
  }

  /**
   * Creates a new product in the backend
   * @param body - Product data to create
   */
  const createProduct = async (body: CreateProductDto) => {
    try {
      console.log(typeof body.PLU)
      const res = await axios.post(`${EDEN_MARKET_BACKEND_URL}/product`, body, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      return res.data
    } catch (error) {
      console.log('Error creating product:', error)
      return null
    }
  }

  /**
   * Fetches branches data
   */
  const fetchBranches = async () => {
    if (!jwt || !user?.id) return []
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
      return []
    }
  }

  /**
   * Fetches revenue per branch analytics
   */
  const fetchRevenuePerBranch = async (): Promise<RevenuePerBranch[]> => {
    if (!jwt || !user?.id) return []
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/branch/analytics/revenue-per-branch`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      return res.data
    } catch (error) {
      console.log('Error fetching revenue per branch:', error)
      return []
    }
  }

  /**
   * Fetches active branches count
   */
  const fetchActiveBranchesCount = async (): Promise<number> => {
    if (!jwt || !user?.id) return 0
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/branch/analytics/active-count`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      return res.data
    } catch (error) {
      console.log('Error fetching active branches count:', error)
      return 0
    }
  }

  /**
   * Fetches total revenue
   */
  const fetchTotalRevenue = async (): Promise<number> => {
    if (!jwt || !user?.id) return 0
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/branch/analytics/total-revenue`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      return res.data
    } catch (error) {
      console.log('Error fetching total revenue:', error)
      return 0
    }
  }

  /**
   * Fetches total transactions
   */
  const fetchTotalTransactions = async (): Promise<number> => {
    if (!jwt || !user?.id) return 0
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/branch/analytics/total-transactions`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      return res.data
    } catch (error) {
      console.log('Error fetching total transactions:', error)
      return 0
    }
  }

  /**
   * Fetches low stock alerts
   * @param threshold - Stock threshold (default: 20)
   */
  const fetchLowStockAlerts = async (
    threshold = 20
  ): Promise<LowStockAlert[]> => {
    if (!jwt || !user?.id) return []
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/stock/analytics/low-stock-alerts?threshold=${threshold}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      return res.data
    } catch (error) {
      console.log('Error fetching low stock alerts:', error)
      return []
    }
  }

  /**
   * Fetches low stock count
   * @param threshold - Stock threshold (default: 20)
   */
  const fetchLowStockCount = async (threshold = 20): Promise<number> => {
    if (!jwt || !user?.id) return 0
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/stock/analytics/low-stock-count?threshold=${threshold}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      return res.data
    } catch (error) {
      console.log('Error fetching low stock count:', error)
      return 0
    }
  }

  /**
   * Fetches all branch analytics data
   */
  const fetchBranchAnalytics = async (): Promise<BranchAnalytics> => {
    try {
      const [
        revenuePerBranch,
        activeBranchesCount,
        totalRevenue,
        totalTransactions,
      ] = await Promise.all([
        fetchRevenuePerBranch(),
        fetchActiveBranchesCount(),
        fetchTotalRevenue(),
        fetchTotalTransactions(),
      ])

      return {
        revenuePerBranch,
        activeBranchesCount,
        totalRevenue,
        totalTransactions,
      }
    } catch (error) {
      console.log('Error fetching branch analytics:', error)
      return {
        revenuePerBranch: [],
        activeBranchesCount: 0,
        totalRevenue: 0,
        totalTransactions: 0,
      }
    }
  }

  /**
   * Fetches all stock analytics data
   * @param threshold - Stock threshold (default: 20)
   */
  const fetchStockAnalytics = async (
    threshold = 20
  ): Promise<StockAnalytics> => {
    try {
      const [lowStockAlerts, lowStockCount] = await Promise.all([
        fetchLowStockAlerts(threshold),
        fetchLowStockCount(threshold),
      ])

      return {
        lowStockAlerts,
        lowStockCount,
      }
    } catch (error) {
      console.log('Error fetching stock analytics:', error)
      return {
        lowStockAlerts: [],
        lowStockCount: 0,
      }
    }
  }

  /**
   * Creates a new transaction in the backend
   * @param body - Transaction data to create
   */

  const createTransaction = async (body: CreateTransactionDto) => {
    try {
      const res = await axios.post(`${EDEN_MARKET_BACKEND_URL}/transaction`, body, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      return res.data
    } catch (error) {
      console.log('Error creating transaction:', error)
      return null
    }
  }

  const fetchTransactions = async () => {
    if (!jwt || !user?.id) return []
    try {
      const res = await axios.get(`${EDEN_MARKET_BACKEND_URL}/transaction`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      return res.data
    } catch (error) {
      console.log('Error fetching transactions:', error)
      return []
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
    fetchProductByBarcode,
    fetchBranches,
    createUser,
    createProduct,
    updateUser,
    fetchTransactions,
    createTransaction,
    // ** Analytics methods
    fetchRevenuePerBranch,
    fetchActiveBranchesCount,
    fetchTotalRevenue,
    fetchTotalTransactions,
    fetchLowStockAlerts,
    fetchLowStockCount,
    fetchBranchAnalytics,
    fetchStockAnalytics,
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
