"use client"
// ** React
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

// ** Hooks
import axios, { AxiosError } from 'axios'

// ** Utils
import { safeLocalStorage } from '@/utils/lib/storage'

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
  ProductForm,
  Stock,
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
// Delivery order types
export type DeliveryOrderItem = {
  productId: string;
  quantity: number;
};

export type CreateDeliveryOrderDto = {
  address: string;
  deliveryTime: string;
  cashierId: string;
  courierId: string;
  items: DeliveryOrderItem[];
};

export type DeliveryOrder = {
  id: string;
  address: string;
  deliveryTime: string;
  status: string;
  cashierId: string;
  courierId: string;
  items: DeliveryOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProductDto = {
  products: ProductForm[]
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
  branch: Branch
  currentStock: number
  threshold: number
}

export type StockByBranch = {
  id: string
  product: Product
  branch: Branch
  quantity: number
  isLowStock: boolean
  threshold: number
}

export type BranchAnalytics = {
  revenuePerBranch: RevenuePerBranch[]
  activeBranchesCount: number
  totalRevenue: number
}

export type StockAnalytics = {
  lowStockAlerts: LowStockAlert[]
  lowStockCount: number
}

export type EdenMarketBackendValue = {
  user: User | null
  products: Product[]
  branches: Branch[]
  transactions: Transaction[]
  totalRevenue: number
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
  fetchTotalRevenueByBranch: () => Promise<number>
  fetchTotalRevenue: () => Promise<number>
  fetchLowStockAlerts: (threshold?: number) => Promise<LowStockAlert[]>
  fetchLowStockCount: (threshold?: number) => Promise<number>
  fetchBranchAnalytics: () => Promise<BranchAnalytics>
  fetchStockAnalytics: (threshold?: number) => Promise<StockAnalytics>
  fetchStockByBranch: (branchId?: string) => Promise<StockByBranch[]>
  addStockToProduct: (
    productId: string,
    branchId: string,
    quantity: number
  ) => Promise<Stock | null>
  // Delivery order methods
  createDeliveryOrder: (body: CreateDeliveryOrderDto) => Promise<DeliveryOrder | null>
  fetchDeliveryOrders: (params?: Record<string, string>) => Promise<DeliveryOrder[]>
  updateDeliveryOrderStatus: (id: string, status: string) => Promise<DeliveryOrder | null>
  fetchCouriers: () => Promise<User[]>
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
  // Obtener usuarios con rol 'courier'
  const fetchCouriers = async (): Promise<User[]> => {
    if (!jwt) return [];
    try {
      const res = await axios.get(`${EDEN_MARKET_BACKEND_URL}/user`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      // Filtrar por rol 'courier' (o 'cadete' si así lo llamas en el backend)
      return res.data.filter((u: User) => u.role === 'courier' || u.role === 'cadete');
    } catch (error) {
      console.log('Error fetching couriers:', error);
      return [];
    }
  };
   *                  States                       *
   *************************************************/
  const [user, setUser] = useState<User | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalRevenue, setTotalRevenue] = useState<number>(0)

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

  // Delivery order DTOs ya exportados arriba

  // Crear pedido de envío
  const createDeliveryOrder = async (body: CreateDeliveryOrderDto): Promise<DeliveryOrder | null> => {
    try {
      const res = await axios.post(
        `${EDEN_MARKET_BACKEND_URL}/delivery-order`,
        body,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      return res.data;
    } catch (error) {
      console.log('Error creando pedido de envío:', error);
      return null;
    }
  };

  // Listar pedidos de envío (puede filtrar por cashier, courier, estado, etc)
  const fetchDeliveryOrders = async (params?: Record<string, string>): Promise<DeliveryOrder[]> => {
    try {
      let url = `${EDEN_MARKET_BACKEND_URL}/delivery-order`;
      if (params) {
        const query = new URLSearchParams(params).toString();
        url += `?${query}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (error) {
      console.log('Error listando pedidos de envío:', error);
      return [];
    }
  };

  // Actualizar estado de pedido de envío
  const updateDeliveryOrderStatus = async (id: string, status: string): Promise<DeliveryOrder | null> => {
    try {
      const res = await axios.patch(
        `${EDEN_MARKET_BACKEND_URL}/delivery-order/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      return res.data;
    } catch (error) {
      console.log('Error actualizando estado del pedido:', error);
      return null;
    }
  };

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
   * Fetches total revenue by branch
   */
  const fetchTotalRevenueByBranch = async (): Promise<number> => {
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
      const [revenuePerBranch, activeBranchesCount, totalRevenue] =
        await Promise.all([
          fetchRevenuePerBranch(),
          fetchActiveBranchesCount(),
          fetchTotalRevenueByBranch(),
        ])

      return {
        revenuePerBranch,
        activeBranchesCount,
        totalRevenue,
      }
    } catch (error) {
      console.log('Error fetching branch analytics:', error)
      return {
        revenuePerBranch: [],
        activeBranchesCount: 0,
        totalRevenue: 0,
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
   * Fetches stock data by branch
   * @param branchId - Optional branch ID to filter by
   */
  const fetchStockByBranch = async (
    branchId?: string
  ): Promise<StockByBranch[]> => {
    if (!jwt || !user?.id) return []
    try {
      const url = branchId
        ? `${EDEN_MARKET_BACKEND_URL}/stock/analytics/by-branch?branchId=${branchId}`
        : `${EDEN_MARKET_BACKEND_URL}/stock/analytics/by-branch`

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      return res.data
    } catch (error) {
      console.log('Error fetching stock by branch:', error)
      return []
    }
  }

  /**
   * Creates a new transaction in the backend
   * @param body - Transaction data to create
   */

  const createTransaction = async (body: CreateTransactionDto) => {
    try {
      const res = await axios.post(
        `${EDEN_MARKET_BACKEND_URL}/transaction`,
        body,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )

      console.log('res', res)
      return res.data
    } catch (error) {
      const axiosError = error as AxiosError

      // Extract error message from response
      if (
        axiosError.response?.data &&
        typeof axiosError.response.data === 'object'
      ) {
        const errorData = axiosError.response.data as { message?: string }
        return errorData.message || 'Error creating transaction'
      }
      return 'Error creating transaction'
    }
  }

  /**
   * Fetches transactions data
   * @returns {Promise<Transaction[]>} Transactions data
   */
  const fetchTransactions = async () => {
    if (!jwt || !user?.id) return []
    try {
      const res = await axios.get(`${EDEN_MARKET_BACKEND_URL}/transaction`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      setTransactions(res.data)
      return res.data
    } catch (error) {
      console.log('Error fetching transactions:', error)
      return []
    }
  }

  /**
   * Fetches total revenue
   * @returns {Promise<number>} Total revenue
   */
  const fetchTotalRevenue = async (): Promise<number> => {
    if (!jwt || !user?.id) return 0
    try {
      const res = await axios.get(
        `${EDEN_MARKET_BACKEND_URL}/transaction/analytics/total-revenue`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      setTotalRevenue(res.data)
      return res.data
    } catch (error) {
      console.log('Error fetching total revenue:', error)
      return 0
    }
  }

  /**
   * Adds stock to a specific product in a specific branch
   * @param productId - Product ID
   * @param branchId - Branch ID
   * @param quantity - Quantity to add
   * @returns {Promise<any>} Updated stock data
   */
  const addStockToProduct = async (
    productId: string,
    branchId: string,
    quantity: number
  ) => {
    if (!jwt) {
      throw new Error('No authentication token')
    }
    try {
      const res = await axios.post(
        `${EDEN_MARKET_BACKEND_URL}/stock/add-to-product`,
        {
          productId,
          branchId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )
      return res.data
    } catch (error) {
      console.log('Error adding stock to product:', error)
      throw error
    }
  }

  // Definir fetchCouriers antes del objeto value
  // Obtener usuarios con rol 'courier'
  const fetchCouriers = async (): Promise<User[]> => {
    if (!jwt) return [];
    try {
      const res = await axios.get(`${EDEN_MARKET_BACKEND_URL}/user`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      // Filtrar por rol 'courier' (o 'cadete' si así lo llamas en el backend)
      return res.data.filter((u: User) => u.role === 'courier' || u.role === 'cadete');
    } catch (error) {
      console.log('Error fetching couriers:', error);
      return [];
    }
  };

  const value: EdenMarketBackendValue = {
    user,
    products,
    branches,
    transactions,
    totalRevenue,
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
    fetchTotalRevenueByBranch,
    fetchTotalRevenue,
    fetchLowStockAlerts,
    fetchLowStockCount,
    fetchBranchAnalytics,
    fetchStockAnalytics,
    fetchStockByBranch,
    addStockToProduct,
    // Delivery order methods
    createDeliveryOrder,
    fetchDeliveryOrders,
  updateDeliveryOrderStatus,
  fetchCouriers,
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

/**
 * Tipos exportados para uso en componentes
 */

export type Product = {
  id: string;
  name: string;
  price: number;
  // Agrega otros campos según tu modelo
};

export type User = {
  id: string;
  username: string;
  role: string;
  // Agrega otros campos según tu modelo
};
